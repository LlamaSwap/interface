import { useMemo } from 'react';
import { chainsMap } from '~/components/Aggregator/constants';
import { getAllChains } from '~/components/Aggregator/router';
import { IToken } from '~/types';
import { useQueryParams } from './useQueryParams';

const chains = getAllChains();

export function useSelectedChainAndTokens({ tokens }) {
	const { chainName, fromTokenAddress, toTokenAddress } = useQueryParams();

	return useMemo(() => {
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
}
