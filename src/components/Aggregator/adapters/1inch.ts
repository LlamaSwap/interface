// Source https://docs.1inch.io/docs/aggregation-protocol/api/swagger

import { ethers } from 'ethers';
import { applyArbitrumFees } from '../utils/arbitrumFees';
import { altReferralAddress } from '../constants';
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
	//zksync: 324
};

const spenders = {
	ethereum: '0x1111111254fb6c44bac0bed2854e76f90643097d',
	bsc: '0x1111111254fb6c44bac0bed2854e76f90643097d',
	polygon: '0x1111111254fb6c44bac0bed2854e76f90643097d',
	optimism: '0x1111111254760f7ab3f16433eea9304126dcd199',
	arbitrum: '0x1111111254fb6c44bac0bed2854e76f90643097d',
	gnosis: '0x1111111254fb6c44bac0bed2854e76f90643097d',
	avax: '0x1111111254fb6c44bac0bed2854e76f90643097d',
	fantom: '0x1111111254fb6c44bac0bed2854e76f90643097d',
	klaytn: '0x1111111254fb6c44bac0bed2854e76f90643097d',
	aurora: '0x1111111254fb6c44bac0bed2854e76f90643097d'
	//zksync
};

export const name = '1inch';
export const token = '1INCH';
export const referral = true;

export function approvalAddress(chain: string) {
	// https://api.1inch.io/v4.0/1/approve/spender
	return spenders[chain];
}
const nativeToken = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

export async function getQuote(chain: string, from: string, to: string, amount: string, extra) {
	// ethereum = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE
	// amount should include decimals

	const tokenFrom = from === ethers.constants.AddressZero ? nativeToken : from;
	const tokenTo = to === ethers.constants.AddressZero ? nativeToken : to;
	const authHeader = { 'auth-key': process.env.INCH_API_KEY };
	const tokenApprovalAddress = spenders[chain];

	const [data, swapData] = await Promise.all([
		fetch(
			`https://api-defillama.1inch.io/v4.0/${chainToId[chain]}/quote?fromTokenAddress=${tokenFrom}&toTokenAddress=${tokenTo}&amount=${amount}&slippage=${extra.slippage}`,
			{ headers: authHeader }
		).then((r) => r.json()),
		extra.userAddress !== ethers.constants.AddressZero
			? fetch(
					`https://api-defillama.1inch.io/v4.0/${chainToId[chain]}/swap?fromTokenAddress=${tokenFrom}&toTokenAddress=${tokenTo}&amount=${amount}&fromAddress=${extra.userAddress}&slippage=${extra.slippage}&referrerAddress=${altReferralAddress}&disableEstimate=true`,
					{ headers: authHeader }
			  ).then((r) => r.json())
			: null
	]);

	const estimatedGas = data.estimatedGas || 0;

	let gas = estimatedGas;

	if (chain === 'arbitrum')
		gas = swapData === null ? null : await applyArbitrumFees(swapData.tx.to, swapData.tx.data, gas);

	return {
		amountReturned: swapData?.toTokenAmount ?? data.toTokenAmount,
		estimatedGas: gas,
		tokenApprovalAddress,
		rawQuote: swapData === null ? null : { ...swapData, tx: swapData.tx },
		logo: 'https://icons.llamao.fi/icons/protocols/1inch-network?w=48&q=75'
	};
}

export async function swap({ signer, rawQuote, chain }) {
	const txObject = {
		from: rawQuote.tx.from,
		to: rawQuote.tx.to,
		data: rawQuote.tx.data,
		value: rawQuote.tx.value
	};
	const gasPrediction = await signer.estimateGas(txObject);
	const tx = await sendTx(signer, chain, {
		...txObject,
		gasLimit: gasPrediction.mul(12).div(10).add(86000) // Increase gas +20% + 2 erc20 txs
	});
	return tx;
}

export const getTxData = ({ rawQuote }) => rawQuote?.tx?.data;

export const getTx = ({ rawQuote }) => {
	if (rawQuote === null) {
		return {};
	}
	return {
		from: rawQuote.tx.from,
		to: rawQuote.tx.to,
		data: rawQuote.tx.data,
		value: rawQuote.tx.value
	};
};
