import { useQuery } from '@tanstack/react-query';
import { Token } from '~/components/Aggregator';

type ChainId = number | string;
type Address = string;
type Balances = Record<ChainId, Record<Address, Token>>;

const getBalances = async (address) => {
	if (!address) return {};
	const balances = await fetch(
		`https://rifcoe52qb.execute-api.eu-central-1.amazonaws.com/balances/${address}/tokens`
	).then((r) => r.json());

	const balancesByChain: Balances = balances.chains.reduce(
		(acc, chainBalances) => ({
			...acc,
			[chainBalances.chainId]: chainBalances.balances.reduce((inAcc, token) => ({
				...inAcc,
				[token.address.toLowerCase()]: token
			}))
		}),
		{}
	);

	return balancesByChain;
};

const useTokenBalances = (address) => {
	return useQuery<Balances>(['balances', address], () => getBalances(address), {
		refetchInterval: 20_000
	});
};

export default useTokenBalances;
