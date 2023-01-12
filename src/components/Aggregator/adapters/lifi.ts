// Source https://docs.1inch.io/docs/aggregation-protocol/api/swagger

import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { ExtraData } from '../types';

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

	const tokenFrom = from === ethers.constants.AddressZero ? nativeToken : from;
	const tokenTo = to === ethers.constants.AddressZero ? nativeToken : to;
	const data = await fetch(
		`https://li.quest/v1/quote?fromChain=${chainToId[chain]}&toChain=${
			chainToId[chain]
		}&fromToken=${tokenFrom}&toToken=${tokenTo}&fromAmount=${amount}&fromAddress=${
			extra.userAddress === '0x0000000000000000000000000000000000000000'
				? '0x1000000000000000000000000000000000000001'
				: extra.userAddress
		}&slippage=${+extra.slippage / 100 || '0.05'}`
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

export async function swap({ signer, rawQuote, chain }) {
	const tx = await signer.sendTransaction({
		from: rawQuote.transactionRequest.from,
		to: rawQuote.transactionRequest.to,
		data: rawQuote.transactionRequest.data,
		value: rawQuote.transactionRequest.value,
		...(chain === 'optimism' && { gasLimit: rawQuote.gasLimit })
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
