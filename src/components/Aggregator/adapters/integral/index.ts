import { ethers } from 'ethers';
import { providers } from '../../rpcs';
import { ABI } from './abi';
import { BigNumber } from 'bignumber.js';
import { sendTx } from '../../utils/sendTx';
import { Interface } from '@ethersproject/abi';

// registry addresses
export const chainToId = {
	ethereum: '0xd17b3c9784510E33cD5B87b490E79253BcD81e2E'
};
export const name = 'Integral';
export const token = 'ITGR';
export const isOutputAvailable = true;

const SUBMIT_DEADLINE = 30 * 60;
const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';

export async function getQuote(chain: string, from: string, to: string, amount: string, { amountOut, slippage }) {
	const relayerContract = new ethers.Contract(chainToId[chain], ABI, providers[chain]);
	try {
		const isBuy = amountOut && amountOut !== '0';
		from = from === ethers.constants.AddressZero ? WETH : from;
		to = to === ethers.constants.AddressZero ? WETH : to;
		const quote = isBuy
			? await relayerContract.quoteBuy(from, to, amountOut)
			: await relayerContract.quoteSell(from, to, amount);
		return {
			amountIn: isBuy ? quote.toString() : amount,
			amountReturned: isBuy ? amountOut : quote.toString(),
			estimatedGas: 50000,
			tokenApprovalAddress: chainToId[chain],
			rawQuote: {
				from,
				to,
				side: isBuy ? 'buy' : 'sell',
				amountIn: isBuy ? quote.toString() : amount,
				amountOut: isBuy ? amountOut : quote.toString(),
				slippage
			},
			logo: 'https://assets.coingecko.com/markets/images/1022/small/integral_size.jpeg?1672994513'
		};
	} catch (error) {
		throw new Error('Integral cannot get quote');
	}
}

export async function swap({ chain, from, to, signer, rawQuote }) {
	const fromAddress = await signer.getAddress();
	const wrapUnwrap = from == ethers.constants.AddressZero || to == ethers.constants.AddressZero;
	const amountInMax = BigNumber(rawQuote.amountIn)
		.times(BigNumber(1 + Number(rawQuote.slippage) / 100))
		.toFixed(0, 1);
	const amountOutMin = BigNumber(rawQuote.amountOut)
		.times(BigNumber(1 - Number(rawQuote.slippage) / 100))
		.toFixed(0, 1);
	const isBuy = rawQuote.side && rawQuote.side == 'buy';
	const data = isBuy
		? new Interface(ABI).encodeFunctionData('buy', [
				{
					tokenIn: rawQuote.from,
					tokenOut: rawQuote.to,
					amountInMax,
					amountOut: rawQuote.amountOut,
					wrapUnwrap,
					to: fromAddress,
					gasLimit: 450000,
					submitDeadline: Math.floor(Date.now() / 1000) + SUBMIT_DEADLINE
				}
		  ])
		: new Interface(ABI).encodeFunctionData('sell', [
				{
					tokenIn: rawQuote.from,
					tokenOut: rawQuote.to,
					amountIn: rawQuote.amountIn,
					amountOutMin,
					wrapUnwrap,
					to: fromAddress,
					gasLimit: 450000,
					submitDeadline: Math.floor(Date.now() / 1000) + SUBMIT_DEADLINE
				}
		  ]);

	const tx = await sendTx(signer, chain, {
		from: fromAddress,
		to: chainToId[chain],
		data,
		value: from == ethers.constants.AddressZero ? (isBuy ? amountInMax : rawQuote.amountIn) : 0,
		gasLimit: 450000
	});

	return tx;
}
