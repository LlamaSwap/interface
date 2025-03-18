import { useMemo } from 'react';
import { chainsMap } from '~/components/Aggregator/constants';
import { getAllChains } from '~/components/Aggregator/router';
import { IToken } from '~/types';
import { useQueryParams } from './useQueryParams';
import { useGetTokenListByChain } from '~/queries/useGetTokenList';
import { useToken } from '~/components/Aggregator/hooks/useToken';
import { isAddress, zeroAddress } from 'viem';
import { nativeTokens } from '~/components/Aggregator/nativeTokens';

const chains = getAllChains();

export function useSelectedChainAndTokens() {
	const { chainName, fromTokenAddress, toTokenAddress } = useQueryParams();

	const { data: tokenList, isLoading: fetchingTokenList } = useGetTokenListByChain({
		chainId: chainName ? chainsMap[chainName] : null
	});

	const data = useMemo(() => {
		const selectedChain = chains.find((c) => c.value === chainName);

		const selectedFromToken =
			fromTokenAddress && isAddress(fromTokenAddress)
				? (fromTokenAddress === zeroAddress && selectedChain
						? nativeTokens.find((t) => t.chainId === selectedChain.chainId)
						: null) ??
					tokenList?.[fromTokenAddress.toLowerCase()] ??
					null
				: null;

		const selectedToToken =
			toTokenAddress && isAddress(toTokenAddress)
				? (toTokenAddress === zeroAddress && selectedChain
						? nativeTokens.find((t) => t.chainId === selectedChain.chainId)
						: null) ??
					tokenList?.[toTokenAddress.toLowerCase()] ??
					null
				: null;

		return {
			selectedChain: selectedChain ? { ...selectedChain, id: chainsMap[selectedChain.value] } : null,
			selectedFromToken: selectedFromToken
				? { ...selectedFromToken, label: selectedFromToken.symbol, value: selectedFromToken.address }
				: null,
			selectedToToken: selectedToToken
				? { ...selectedToToken, label: selectedToToken.symbol, value: selectedToToken.address }
				: null,
			chainTokenList: (tokenList ?? {}) as Record<string, IToken>
		};
	}, [chainName, fromTokenAddress, toTokenAddress, tokenList]);

	// data of selected token not in chain's tokenlist
	const { data: fromToken2, isLoading: fetchingFromToken2 } = useToken({
		address: fromTokenAddress as `0x${string}`,
		chainId: data.selectedChain?.id,
		enabled:
			typeof fromTokenAddress === 'string' &&
			isAddress(fromTokenAddress) &&
			data.selectedChain &&
			data.selectedFromToken === null &&
			!fetchingTokenList
				? true
				: false
	});

	const { data: toToken2, isLoading: fetchingToToken2 } = useToken({
		address: toTokenAddress as `0x${string}`,
		chainId: data.selectedChain?.id,
		enabled:
			typeof toTokenAddress === 'string' &&
			isAddress(toTokenAddress) &&
			data.selectedChain &&
			data.selectedToToken === null &&
			!fetchingTokenList
				? true
				: false
	});

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
			fetchingFromToken: !finalSelectedFromToken && (fetchingTokenList || fetchingFromToken2) ? true : false,
			fetchingToToken: !finalSelectedToToken && (fetchingTokenList || fetchingToToken2) ? true : false
		};
	}, [data, fromToken2, toToken2, fetchingTokenList]);
}
