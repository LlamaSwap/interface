// Source https://docs.1inch.io/docs/aggregation-protocol/api/swagger

import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { applyArbitrumFees } from '../utils/arbitrumFees';
import { defillamaReferrerAddress } from '../constants';
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
	klaytn: 8217,
	aurora: 1313161554
};

export const name = '1inch';
export const token = '1INCH';
export const referral = true;

export function approvalAddress() {
	// https://api.1inch.io/v4.0/1/approve/spender
	return '0x1111111254fb6c44bac0bed2854e76f90643097d';
}
const nativeToken = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

export async function getQuote(chain: string, from: string, to: string, amount: string, extra) {
	// ethereum = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE
	// amount should include decimals

	const tokenFrom = from === ethers.constants.AddressZero ? nativeToken : from;
	const tokenTo = to === ethers.constants.AddressZero ? nativeToken : to;

	const [data, { address: tokenApprovalAddress }, swapData] = await Promise.all([
		fetch(
			`https://api.1inch.io/v4.0/${chainToId[chain]}/quote?fromTokenAddress=${tokenFrom}&toTokenAddress=${tokenTo}&amount=${amount}&slippage=${extra.slippage}`
		).then((r) => r.json()),
		fetch(`https://api.1inch.io/v4.0/${chainToId[chain]}/approve/spender`).then((r) => r.json()),
		extra.userAddress !== ethers.constants.AddressZero
			? fetch(
					`https://api.1inch.io/v4.0/${chainToId[chain]}/swap?fromTokenAddress=${tokenFrom}&toTokenAddress=${tokenTo}&amount=${amount}&fromAddress=${extra.userAddress}&slippage=${extra.slippage}&referrerAddress=${defillamaReferrerAddress}&disableEstimate=true`
			  ).then((r) => r.json())
			: null
	]);

	const estimatedGas = data.estimatedGas || 0;

	let gas = estimatedGas;

	if (chain === 'optimism') gas = BigNumber(3.5).times(estimatedGas).toFixed(0, 1);
	if (chain === 'arbitrum')
		gas = swapData === null ? null : await applyArbitrumFees(swapData.tx.to, swapData.tx.data, gas);

	return {
		amountReturned: swapData?.toTokenAmount ?? data.toTokenAmount,
		estimatedGas: gas,
		tokenApprovalAddress,
		rawQuote: swapData === null ? null : { ...swapData, tx: { ...swapData.tx, gasLimit: gas } },
		logo: 'https://defillama.com/_next/image?url=https%3A%2F%2Ficons.llama.fi%2F1inch-network.jpg&w=48&q=75'
	};
}

export async function swap({ signer, rawQuote, chain }) {
	const tx = await sendTx(signer, chain, {
		from: rawQuote.tx.from,
		to: rawQuote.tx.to,
		data: rawQuote.tx.data,
		value: rawQuote.tx.value,
		...(chain === 'optimism' && { gasLimit: rawQuote.tx.gasLimit })
	});
	return tx;
}

export const getTxData = ({ rawQuote }) => rawQuote?.tx?.data;

export const getTx = ({ rawQuote }) => ({
	from: rawQuote.tx.from,
	to: rawQuote.tx.to,
	data: rawQuote.tx.data,
	value: rawQuote.tx.value
});
