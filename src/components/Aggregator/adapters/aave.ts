import { IStaticATokenLM_ABI, tokenlist } from '@bgd-labs/aave-address-book';
import { sendTx } from '../utils/sendTx';
import { ethers, Signer } from 'ethers';
import { Interface } from 'ethers/lib/utils.js';
import { providers } from '../rpcs';

export const chainToId = {
	ethereum: 1,
	bsc: 56,
	polygon: 137,
	optimism: 10,
	arbitrum: 42161,
	gnosis: 100,
	avax: 43114,
	base: 8453,
	scroll: 534352,
	metis: 1088
};

export const name = 'aave';
export const token = 'aave';
export const referral = false;

type Quote = {
	to: string;
	amount: string;
	isFromUnderlying: boolean;
};

const stata = new Interface(IStaticATokenLM_ABI);

export async function getQuote(chain: string, from: string, to: string, amount: string) {
	const chainId = chainToId[chain];
	const targetAsset = tokenlist.tokens.find(
		(token) => token.chainId === chainId && token.address.toLowerCase() === to.toLowerCase()
	);
	if (!targetAsset || !targetAsset.tags.includes('stataToken')) return null;
	const isFromUnderlying = targetAsset.extensions.underlying.toLowerCase() === from.toLowerCase();
	const isFromAToken = targetAsset.extensions.underlyingAToken.toLowerCase() === from.toLowerCase();
	if (!isFromAToken && !isFromUnderlying) return null;
	const stataToken = new ethers.Contract(to, IStaticATokenLM_ABI, providers[chain]);
	const amountOut = await stataToken.previewDeposit(amount);
	return {
		amountReturned: amountOut,
		estimatedGas: isFromUnderlying ? 250_000 : 100_000,
		tokenApprovalAddress: to,
		rawQuote: { to, amount, isFromUnderlying } as Quote
	};
}

export async function swap({ signer, rawQuote, chain }: { signer: Signer; rawQuote: Quote; chain: string }) {
	const txObject = {
		from: signer.getAddress(),
		to: rawQuote.to,
		data: stata.encodeFunctionData('deposit', [rawQuote.amount, signer.getAddress(), 0, rawQuote.isFromUnderlying]),
		value: 0
	};
	const gasPrediction = await signer.estimateGas(txObject);
	const tx = await sendTx(signer, chain, {
		...txObject,
		gasLimit: gasPrediction.mul(12).div(10).add(86000)
	});
	return tx;
}
