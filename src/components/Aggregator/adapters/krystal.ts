import BigNumber from 'bignumber.js';

export const chainToId = {
	ethereum: 'ethereum',
	bsc: 'bsc',
	polygon: 'polygon',
	avax: 'avalanche',
	cronos: 'cronos',
	fantom: 'fantom',
	arbitrum: 'arbitrum',
	aurora: 'aurora',
	klaytn: 'klaytn'
};

export const name = 'Krystal';
export const token = null;

export function approvalAddress(chain: string) {
	return ''; // need to fix
}

export async function getQuote(chain: string, from: string, to: string, amount: string) {
	// gas token is 0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
	const data = await fetch(
		`https://api.krystal.app/${chainToId[chain]}/v2/swap/allRates?src=${from}&srcAmount=${amount}&dest=${to}&platformWallet=0x168E4c3AC8d89B00958B6bE6400B066f0347DDc9`
	).then((r) => r.json());

	const estimatedGas =
		chain === 'optimism' ? BigNumber(3.5).times(data.rates[0].estimatedGas).toFixed(0, 1) : data.rates[0].estimatedGas;

	return {
		amountReturned: data.rates[0].amount,
		estimatedGas
	};
}
