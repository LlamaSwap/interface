import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { sendTx } from '../utils/sendTx';

export const chainToId = {
	ethereum: 1,
	bsc: 56,
	polygon: 137,
	optimism: 10,
	arbitrum: 42161,
	gnosis: 100,
	avax: 43114,
	fantom: 250,
	aurora: 1313161554,
	heco: 128,
	harmony: 1666600000,
	boba: 288,
	okexchain: 66,
	cronos: 25,
	moonriver: 1285
};

export const name = 'OpenOcean';
export const token = 'OOE';

export function approvalAddress() {
	return '0x6352a56caadc4f1e25cd6c75970fa768a3304e64';
}

// https://docs.openocean.finance/dev/openocean-api-3.0/quick-start
// the api from their docs is broken
// eg: https://open-api.openocean.finance/v3/eth/quote?inTokenAddress=0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9&outTokenAddress=0x8888801af4d980682e47f1a9036e589479e835c5&amount=100000000000000000000&gasPrice=400000000
// returns a AAVE->MPH trade that returns 10.3k MPH, when in reality that trade only gets you 3.8k MPH
// Replaced API with the one you get from snooping in their frontend, which works fine
export async function getQuote(chain: string, from: string, to: string, amount: string, { slippage, userAddress }) {
	const gasPrice = await fetch(`https://ethapi.openocean.finance/v2/${chainToId[chain]}/gas-price`).then((r) =>
		r.json()
	);
	const data = await fetch(
		`https://ethapi.openocean.finance/v2/${
			chainToId[chain]
		}/swap?inTokenAddress=${from}&outTokenAddress=${to}&amount=${amount}&gasPrice=${
			gasPrice.fast?.maxPriorityFeePerGas ?? gasPrice.fast
		}&slippage=${+slippage * 100 || 100}&account=${
			userAddress || ethers.constants.AddressZero
		}&referrer=0x5521c3dfd563d48ca64e132324024470f3498526`
	).then((r) => r.json());

	let gas = data.estimatedGas;

	if (chain === 'optimism') gas = BigNumber(3.5).times(gas).toFixed(0, 1);

	return {
		amountReturned: data.outAmount,
		estimatedGas: gas,
		tokenApprovalAddress: '0x6352a56caadc4f1e25cd6c75970fa768a3304e64',
		rawQuote: { ...data, gasLimit: gas },
		logo: 'https://assets.coingecko.com/coins/images/17014/small/ooe_log.png?1626074195'
	};
}

export async function swap({ signer, rawQuote, chain }) {
	const tx = await sendTx(signer, chain, {
		from: rawQuote.from,
		to: rawQuote.to,
		data: rawQuote.data,
		value: rawQuote.value,
		...(chain === 'optimism' && { gasLimit: rawQuote.gasLimit })
	});
	return tx;
}

export const getTxData = ({ rawQuote }) => rawQuote?.data;

export const getTx = ({ rawQuote }) => ({
	from: rawQuote.from,
	to: rawQuote.to,
	data: rawQuote.data,
	value: rawQuote.value
});
