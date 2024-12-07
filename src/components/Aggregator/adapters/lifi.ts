// Source https://docs.1inch.io/docs/aggregation-protocol/api/swagger

import BigNumber from 'bignumber.js';
import { ExtraData } from '../types';
import { zeroAddress } from 'viem';
import { sendTx } from '../utils/sendTx';

export const chainToId = {
	ethereum: 'eth',
	polygon: 'pol',
	bsc: 'bsc',
	gnosis: 'dai',
	fantom: 'ftm',
	avax: 'ava',
	arbitrum: 'arb',
	optimism: 'opt',
	moonriver: 'mor',
	moonbeam: 'moo',
	celo: 'cel',
	fuse: 'fus',
	cronos: 'cro',
	velas: 'vel',
	aurora: 'aur'
};
export const name = 'LI.FI';
export const token = null;

const nativeToken = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

export async function getQuote(chain: string, from: string, to: string, amount: string, extra: ExtraData) {
	// ethereum = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE
	// amount should include decimals

	const tokenFrom = from === zeroAddress ? nativeToken : from;
	const tokenTo = to === zeroAddress ? nativeToken : to;
	const data = await fetch(
		`https://li.quest/v1/quote?fromChain=${chainToId[chain]}&toChain=${
			chainToId[chain]
		}&fromToken=${tokenFrom}&toToken=${tokenTo}&fromAmount=${amount}&fromAddress=${
			extra.userAddress === zeroAddress ? '0x1000000000000000000000000000000000000001' : extra.userAddress
		}&slippage=${+extra.slippage / 100}`
	).then((r) => r.json());

	const gas = data.estimate.gasCosts.reduce((acc, val) => acc + Number(val.estimate), 0);

	const estimatedGas = chain === 'optimism' ? BigNumber(3.5).times(gas).toFixed(0, 1) : gas;

	return {
		amountReturned: data.estimate.toAmount,
		estimatedGas,
		tokenApprovalAddress: data.estimate.approvalAddress,
		logo: '',
		rawQuote: { ...data, gasLimit: estimatedGas }
	};
}

export async function swap({ rawQuote, chain }) {
	const tx = await sendTx({
		from: rawQuote.transactionRequest.from,
		to: rawQuote.transactionRequest.to,
		data: rawQuote.transactionRequest.data,
		value: rawQuote.transactionRequest.value,
		...(chain === 'optimism' && { gas: rawQuote.gasLimit })
	});

	return tx;
}

export const getTxData = ({ rawQuote }) => rawQuote?.transactionRequest?.data;

export const getTx = ({ rawQuote }) => ({
	from: rawQuote.transactionRequest.from,
	to: rawQuote.transactionRequest.to,
	data: rawQuote.transactionRequest.data,
	value: rawQuote.transactionRequest.value
});
