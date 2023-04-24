import { multiCall } from '@defillama/sdk/build/abi';
import { useQuery } from '@tanstack/react-query';
import { uniq } from 'lodash';
import { useSigner } from 'wagmi';
import { cancelSwap } from '~/components/Aggregator/adapters/cowswap';
import { chainIdToName, chainsMap } from '~/components/Aggregator/constants';
import { useQueryParams } from '~/hooks/useQueryParams';
import { useCowOrders } from './useCowOrder';

const getSwapsHistory = async ({ userId, chain: chainId, tokensUrlMap, tokensSymbolsMap }) => {
	if (!chainId) return [];
	const chain = chainIdToName(chainId);

	const chainTokensSymbols = tokensSymbolsMap[chainId];
	const chainTokensUrls = tokensUrlMap[chainId];
	const history = await fetch(`https://api.llama.fi/getSwapsHistory/?chain=${chain}&userId=${userId}`).then((r) =>
		r.json()
	);

	const tokens = uniq(history.map((tx) => [tx.from?.toLowerCase(), tx.to?.toLowerCase()]).flat());
	const unknownSymbolsAddresses = [];
	tokens.forEach((tokenAddress: string) => {
		if (!chainTokensSymbols[tokenAddress]) unknownSymbolsAddresses.push(tokenAddress);
	});

	let onChainSymbols = null;
	if (unknownSymbolsAddresses.length) {
		const { output: symbols } = await multiCall({
			abi: 'erc20:symbol',
			chain: chain,
			calls: unknownSymbolsAddresses.map((token) => ({ target: token }))
		});

		onChainSymbols = Object.fromEntries(unknownSymbolsAddresses.map((address, i) => [address, symbols[i]?.output]));
	}

	return history.map((tx) => ({
		...tx,
		fromIcon: chainTokensUrls[tx?.from?.toLowerCase()] || '/placeholder.png',
		toIcon: chainTokensUrls[tx?.to?.toLowerCase()] || '/placeholder.png',
		fromSymbol: chainTokensSymbols[tx?.from?.toLowerCase()] || onChainSymbols?.[tx?.from?.toLowerCase()],
		toSymbol: chainTokensSymbols[tx?.to?.toLowerCase()] || onChainSymbols?.[tx?.to?.toLowerCase()]
	}));
};

export function useSwapsHistory({ userId, tokensUrlMap, tokensSymbolsMap, isOpen }) {
	const { chainName } = useQueryParams();

	const chain = chainsMap[chainName];
	const { data: signer } = useSigner();
	const cowData = useCowOrders({ userAddress: userId, onlyNative: true, isOpen });
	const history = useQuery(
		['getSwapsHistory', userId, chain, cowData?.data],
		() => getSwapsHistory({ userId, chain, tokensUrlMap, tokensSymbolsMap }),
		{
			enabled: !!userId && !!chain,
			staleTime: 25_000
		}
	);

	const historyData = history?.data
		?.map((swap) => {
			const rawQuote = swap?.route?.price?.rawQuote;
			if (swap.aggregator === 'CowSwap') {
				const cowOrder = cowData?.data?.find((order) => order?.ethflowData?.userValidTo === rawQuote?.quote?.validTo);

				if (cowOrder && cowOrder.status === 'open') {
					return {
						...swap,
						cancelSwap: () => {
							try {
								cancelSwap({ rawQuote, chain: chainName, to: swap.to, signer }).then(() => {
									cowData?.refetch();
									history?.refetch();
								});
							} catch (e) {
								console.log(e);
							}
						}
					};
				}
				if (cowOrder?.status === 'cancelled') return null;
			}
			return swap;
		})
		.filter(Boolean);

	return { ...history, data: historyData };
}
