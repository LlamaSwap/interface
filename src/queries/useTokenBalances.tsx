import { useQuery } from '@tanstack/react-query';
import type { IToken } from '~/types';

type Balances = Array<IToken>;

function scramble(str: string) {
	return str.split('').reduce((a, b) => {
		return a + String.fromCharCode(b.charCodeAt(0) + 2);
	}, '');
}

const getBalances = async (address, chain) => {
	if (!address || chain) return [];

	const balances: any = await fetch(
		`https://covalent-api.blastapi.io/${scramble(
			'd51c17d5+3065+23a4+6c._+_1.6.`0a3137'
		)}/v1/${chain}/address/${address}/balances_v2/`
	).then((r) => r.json());

	return balances.data.items.map((t: any) => ({
		address: t.contract_address,
		decimals: t.contract_decimals,
		symbol: t.contract_ticker_symbol ?? 'UNKNOWN',
		price: t.quote_rate,
		amount: t.balance,
		balanceUSD: t.quote ?? 0
	}));
};

export const useTokenBalances = (address, chain) => {
	return useQuery<Balances>(['balances', address, chain], () => getBalances(address, chain), {
		refetchInterval: 20_000
	});
};
