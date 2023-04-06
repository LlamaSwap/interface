// Source: https://api.odos.xyz

import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { sendTx } from '../utils/sendTx';

export const chainToId = {
	ethereum: 1,
	optimism: 10,
	bsc: 56,
	polygon: 137,
	arbitrum: 42161,
	avax: 43114,
};

const approvalAddresses = {
	ethereum: '0x76f4eeD9fE41262669D0250b2A97db79712aD855',
	optimism: '0x69Dd38645f7457be13571a847FfD905f9acbaF6d',
	bsc: '0x9f138be5aA5cC442Ea7cC7D18cD9E30593ED90b9',
	polygon: '0xa32EE1C40594249eb3183c10792BcF573D4Da47C',
	arbitrum: '0xdd94018F54e565dbfc939F7C44a16e163FaAb331',
	avax: '0xfE7Ce93ac0F78826CD81D506B07Fe9f459c00214',
};

export const name = 'Odos';
export const token = null;

export function approvalAddress(chain) {
	return approvalAddresses[chain]
}

const nativeToken = '0x0000000000000000000000000000000000000000';
export async function getQuote(
	chain: string,
	from: string,
	to: string,
	amount: string,
	{ userAddress, slippage }
) {
	// ethereum = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE
	// amount should include decimals

	const tokenFrom = from === ethers.constants.AddressZero ? nativeToken : from;
	const tokenTo = to === ethers.constants.AddressZero ? nativeToken : to;

	const quoteData = await fetch(`https://api.odos.xyz/sor/quote`, {
			method: 'POST',
			body: JSON.stringify({
				chainId: chainToId[chain],
				inputTokens: [
					{
						tokenAddress: tokenFrom,
						amount: amount
					}
				],
				outputTokens: [
					{
						tokenAddress: tokenTo,
						proportion: 1
					}
				],
				userAddr: userAddress !== ethers.constants.AddressZero ? userAddress : null,
				slippageLimitPercent: slippage,
				disableRFQs: true,
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		}).then((r) => r.json());

	const swapData =
		userAddress !== ethers.constants.AddressZero
			? await fetch(`https://api.odos.xyz/sor/assemble`, {
					method: 'POST',
					body: JSON.stringify({
						userAddr: userAddress,
						pathId: quoteData.pathId,
						simulate: false
					}),
					headers: {
						'Content-Type': 'application/json'
					}
				}).then((r) => r.json())
			: null;

	return {
		amountReturned: quoteData.outAmounts[0],
		amountIn: quoteData.inAmounts[0],
		estimatedGas: swapData ? swapData.transaction.gas : quoteData.gasEstimate,
		tokenApprovalAddress: approvalAddress(chain),
		rawQuote: swapData && swapData.transaction ? swapData.transaction : { gasLimit: quoteData.gasEstimate },
		logo: 'https://assets.odos.xyz/odos-logo-orange-symbol-only.png'
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

export const getTx = ({ rawQuote }) => {
	if (rawQuote === null) {
		return {};
	}
	return {
		from: rawQuote.from,
		to: rawQuote.to,
		data: rawQuote.data,
		value: rawQuote.value
	}
};
