import { useQuery } from '@tanstack/react-query';
import type { IToken } from '~/types';

type ChainId = number | string;
type Balances = Record<ChainId, Array<IToken>>;

const getBalances = async (address) => {
	if (!address) return {};

	const balances = await fetch(
		`https://js3czchveb.execute-api.eu-central-1.amazonaws.com/balances/${address}/tokens`
	).then((r) => r.json());

	return balances.chains.reduce((acc, chain) => {
		acc = { ...acc, [chain.chainId]: chain.balances };
		return acc;
	}, {});
};

export const useTokenBalances = (address) => {
	return useQuery<Balances>(['balances', address], () => getBalances(address), {
		refetchInterval: 20_000
	});
};
