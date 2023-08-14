// Source: https://api.odos.xyz

import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { sendTx } from '../utils/sendTx';

export const chainToId = {
	ethereum: 1,
	optimism: 10,
	bsc: 56,
	polygon: 137,
	fantom: 250,
	// zksync: 324,
	// base: 8453,
	arbitrum: 42161,
	avax: 43114,
};

const approvalAddresses = {
	ethereum: '0xCf5540fFFCdC3d510B18bFcA6d2b9987b0772559',
	optimism: '0xCa423977156BB05b13A2BA3b76Bc5419E2fE9680',
	bsc: '0x89b8AA89FDd0507a99d334CBe3C808fAFC7d850E',
	polygon: '0x4E3288c9ca110bCC82bf38F09A7b425c095d92Bf',
	fantom: '0xD0c22A5435F4E8E5770C1fAFb5374015FC12F7cD',
	// zksync: '0x4bBa932E9792A2b917D47830C93a9BC79320E4f7',
	// base: '0x19cEeAd7105607Cd444F5ad10dd51356436095a1',
	arbitrum: '0xa669e7A0d4b3e4Fa48af2dE86BD4CD7126Be4e13',
	avax: '0x88de50B233052e4Fb783d4F6db78Cc34fEa3e9FC',
};

export const name = 'Odos';
export const token = null;

const referralCode = 2101375859;

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

	const quoteData = await fetch(`https://api.odos.xyz/sor/quote/v2`, {
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
				referralCode: referralCode,
				compact: true,
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
