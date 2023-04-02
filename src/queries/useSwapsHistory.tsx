import { multiCall } from '@defillama/sdk/build/abi';
import { useQuery } from '@tanstack/react-query';
import { uniq } from 'lodash';
import { chainIdToName, chainsMap } from '~/components/Aggregator/constants';

const getSwapsHistory = async ({ userId, chain: chainId, tokenList }) => {
	const chain = chainIdToName(chainId);
	const history = await fetch(`https://api.llama.fi/getSwapsHistory/?chain=${chain}&userId=${userId}`).then((r) =>
		r.json()
	);

	const tokens = uniq(history.map((tx) => [tx.from?.toLowerCase(), tx.to?.toLowerCase()]).flat());
	const tokensUrlMap = Object.fromEntries(tokens.map((token) => [token, false]));
	const tokensSymbolsMap = { ...tokensUrlMap };
	const unknownSymbolsAddresses = [];
	tokenList[chainsMap[chain]]?.forEach(async (token) => {
		const tokenAddress = token?.address?.toLowerCase();
		if (tokensUrlMap[tokenAddress] !== undefined) {
			tokensUrlMap[tokenAddress] = token.logoURI || token.logoURI2 || '/placeholder.png';
			if (token.symbol) tokensSymbolsMap[tokenAddress] = token.symbol;
			else unknownSymbolsAddresses.push(tokenAddress);
		}
	});

	const { output: symbols } = await multiCall({
		abi: 'erc20:symbol',
		chain: chain,
		calls: unknownSymbolsAddresses.map((token) => ({ target: token }))
	});

	const onChainSymbols = Object.fromEntries(unknownSymbolsAddresses.map((address, i) => [address, symbols[i]?.output]));
	console.log(onChainSymbols);

	return history.map((tx) => ({
		...tx,
		fromIcon: tokensUrlMap[tx?.from?.toLowerCase()],
		toIcon: tokensUrlMap[tx?.to?.toLowerCase()],
		fromSymbol: tokensSymbolsMap[tx?.from?.toLowerCase()] || onChainSymbols[tx?.from?.toLowerCase()],
		toSymbol: tokensSymbolsMap[tx?.to?.toLowerCase()] || onChainSymbols[tx?.to?.toLowerCase()]
	}));
};

export function useSwapsHistory({ userId, chain, tokenList }) {
	return useQuery(['getSwapsHistory', userId, chain], () => getSwapsHistory({ userId, chain, tokenList }), {
		enabled: !!userId && !!chain
	});
}
