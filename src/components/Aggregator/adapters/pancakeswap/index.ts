// This does extremely basic routing, need to look into https://github.com/pancakeswap/pancake-frontend/tree/develop/packages/smart-router/evm to see how pancakeswap does it (or implement some other system)

import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { providers } from '../../rpcs';
import { findSlippageWithNoLosses } from '../../slippage';
import { sendTx } from '../../utils/sendTx';
import { ABI } from './abi';

export const chainToId = {
	bsc: '0x10ED43C718714eb63d5aA57B78B54704E256024E'
};

export const name = 'PancakeSwap';
export const token = 'CAKE';

const factory = {
	bsc: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
	ethereum: '0x1097053Fd2ea711dad45caCcc45EfF7548fCB362'
};

const nativeToken = {
	bsc: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
	ethereum: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
};

export async function getQuote(chain: string, from: string, to: string, amount: string, extra: any) {
	const provider = providers[chain];
	const factoryContract = new ethers.Contract(factory[chain], ABI.factory, provider);
	const normalizeAddress = (address: string) =>
		address === ethers.constants.AddressZero ? nativeToken[chain] : address;
	const pairAddress = await factoryContract.getPair(normalizeAddress(from), normalizeAddress(to));
	const reserves = await new ethers.Contract(pairAddress, ABI.pair, provider).getReserves();
	const [reserveIn, reserveOut] = BigNumber(normalizeAddress(from)).lt(normalizeAddress(to))
		? [reserves._reserve0, reserves._reserve1]
		: [reserves._reserve1, reserves._reserve0];
	const amountOut = await new ethers.Contract(chainToId[chain], ABI.router, provider).getAmountOut(
		amount,
		reserveIn,
		reserveOut
	); // TODO: Calculate this locally
	let slippage = Number(extra.slippage);
	if (extra.isAutoSlippage === true && extra.gasTokenPrice && extra.fromTokenPrice && extra.gasPriceData.gasPrice) {
		// Checks that prices aren't 0
		const txCost =
			(extra.gasTokenPrice * extra.gasPriceData.gasPrice.toNumber() * 21e3) / (extra.fromTokenPrice * 1e18); // Assumes >21e3 gas cost for tx for a uni swap
		const safeSlippafe = findSlippageWithNoLosses(0.25 / 100, Number(reserveIn), Number(amount), txCost) * 100;
		if (safeSlippafe > 0.5 && !Number.isNaN(safeSlippafe)) {
			slippage = Math.min(safeSlippafe, 5);
		}
	}
	const minAmountOut = BigNumber(amountOut.toString())
		.times(1 - slippage / 100)
		.toFixed(0);

	return {
		amountReturned: amountOut.toString(),
		estimatedGas: (200e3).toString(),
		rawQuote: {
			pairAddress,
			minAmountOut,
			amount
		},
		tokenApprovalAddress: chainToId[chain],
		appliedSlippage: slippage
		//logo: 'https://assets.coingecko.com/coins/images/17654/small/yieldyak.png?1665824438'
	};
}

export async function swap({ chain, signer, rawQuote, from, to }) {
	const fromAddress = await signer.getAddress();

	const routerContract = new ethers.Contract(chainToId[chain], ABI.router, signer).populateTransaction;

	const swapFunc = (() => {
		if (from === ethers.constants.AddressZero) return routerContract.swapETHForExactTokens;
		if (to === ethers.constants.AddressZero) return routerContract.swapExactTokensForETH;
		return routerContract.swapExactTokensForTokens;
	})();

	const tx = await swapFunc(
		rawQuote.amount,
		rawQuote.minAmountOut,
		[rawQuote.pairAddress],
		fromAddress,
		Math.round(Date.now() / 1000) + 20 * 60, // +20min
		from === ethers.constants.AddressZero ? { value: rawQuote.amount } : {}
	);

	return sendTx(signer, chain, tx);
}
