import { useMemo } from 'react';
import { chainsMap } from '~/components/Aggregator/constants';
import { getAllChains } from '~/components/Aggregator/router';
import { IToken } from '~/types';
import { useQueryParams } from './useQueryParams';
import { useGetTokenList } from '~/queries/useGetTokenList';
import { useToken } from '~/components/Aggregator/hooks/useToken';

const chains = getAllChains();

export function useSelectedChainAndTokens() {
	const { chainName, fromTokenAddress, toTokenAddress } = useQueryParams();
	const { data: tokens, isLoading: fetchingTokenList } = useGetTokenList();
	const data = useMemo(() => {
		const chainId = chainsMap[chainName];

		const tokenList: Array<IToken> = tokens && chainName ? tokens[chainId] || [] : null;

		const selectedChain = chains.find((c) => c.value === chainName);

		const selectedFromToken = tokenList?.find((t) => t.address.toLowerCase() === fromTokenAddress);

		const selectedToToken = tokenList?.find((t) => t.address.toLowerCase() === toTokenAddress);

		return {
			selectedChain: selectedChain ? { ...selectedChain, id: chainsMap[selectedChain.value] } : null,
			selectedFromToken: selectedFromToken
				? { ...selectedFromToken, label: selectedFromToken.symbol, value: selectedFromToken.address }
				: null,
			selectedToToken: selectedToToken
				? { ...selectedToToken, label: selectedToToken.symbol, value: selectedToToken.address }
				: null,
			chainTokenList: tokenList
		};
	}, [chainName, fromTokenAddress, toTokenAddress, tokens]);

	// data of selected token not in chain's tokenlist
	const { data: fromToken2, isLoading: fetchingFromToken2 } = useToken({
		address: fromTokenAddress as `0x${string}`,
		chainId: data.selectedChain?.id,
		enabled:
			typeof fromTokenAddress === 'string' &&
			fromTokenAddress.length === 42 &&
			data.selectedChain &&
			data.selectedFromToken === null
				? true
				: false
	});

	const { data: toToken2, isLoading: fetchingToToken2 } = useToken({
		address: toTokenAddress as `0x${string}`,
		chainId: data.selectedChain?.id,
		enabled:
			typeof toTokenAddress === 'string' &&
			toTokenAddress.length === 42 &&
			data.selectedChain &&
			data.selectedToToken === null
				? true
				: false
	});

	const fetchingFromToken = fetchingTokenList || fetchingFromToken2;
	const fetchingToToken = fetchingTokenList || fetchingToToken2;

	return useMemo(() => {
		const finalSelectedFromToken: IToken | null =
			data.selectedFromToken === null && fromToken2
				? {
						name: fromToken2.name ?? fromToken2.address.slice(0, 4) + '...' + fromToken2.address.slice(-4),
						label: fromToken2.symbol ?? fromToken2.address.slice(0, 4) + '...' + fromToken2.address.slice(-4),
						symbol: fromToken2.symbol ?? '',
						address: fromToken2.address,
						value: fromToken2.address,
						decimals: fromToken2.decimals,
						logoURI: `https://token-icons.llamao.fi/icons/tokens/${data.selectedChain?.id ?? 1}/${
							fromToken2.address
						}?h=20&w=20`,
						chainId: data.selectedChain?.id ?? 1,
						geckoId: null
					}
				: data.selectedFromToken;

		const finalSelectedToToken: IToken | null =
			data.selectedToToken === null && toToken2
				? {
						name: toToken2.name ?? toToken2.address.slice(0, 4) + '...' + toToken2.address.slice(-4),
						label: toToken2.symbol ?? toToken2.address.slice(0, 4) + '...' + toToken2.address.slice(-4),
						symbol: toToken2.symbol ?? '',
						address: toToken2.address,
						value: toToken2.address,
						decimals: toToken2.decimals,
						logoURI: `https://token-icons.llamao.fi/icons/tokens/${data.selectedChain?.id ?? 1}/${
							toToken2.address
						}?h=20&w=20`,
						chainId: data.selectedChain?.id ?? 1,
						geckoId: null
					}
				: data.selectedToToken;

		return {
			...data,
			finalSelectedFromToken,
			finalSelectedToToken,
			fetchingFromToken,
			fetchingToToken
		};
	}, [data, fromToken2, toToken2]);
}
