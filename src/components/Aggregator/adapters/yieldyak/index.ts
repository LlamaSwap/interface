import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { providers } from '../../rpcs';
import { ABI } from './abi';

// Source https://github.com/yieldyak/yak-aggregator
export const chainToId = {
	avax: '0xC4729E56b831d74bBc18797e0e17A295fA77488c'
};

export const name = 'YieldYak';
export const token = 'YAK';

export function approvalAddress(chain: string) {
	return chainToId[chain];
}

const nativeToken = '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7';

export async function getQuote(chain: string, from: string, to: string, amount: string, extra: any) {
	const routerContract = new ethers.Contract(chainToId[chain], ABI.yieldYakRouter, providers[chain]);
	const tokenFrom = from === ethers.constants.AddressZero ? nativeToken : from;
	const tokenTo = to === ethers.constants.AddressZero ? nativeToken : to;
	const gasPrice = extra.gasPriceData.gasPrice.toNumber();
	const data = await routerContract.findBestPathWithGas(amount, tokenFrom, tokenTo, 3, gasPrice);

	const gasEstimate = chain === 'optimism' ? BigNumber(3.5).times(data.gasEstimate).toFixed(0, 1) : data.gasEstimate;

	return {
		amountReturned: data.amounts[data.amounts.length - 1],
		estimatedGas: gasEstimate, // Gas estimates only include gas-cost of swapping and querying on adapter and not intermediate logic, nor tx-gas-cost.
		rawQuote: data,
		tokenApprovalAddress: '0xC4729E56b831d74bBc18797e0e17A295fA77488c',
		logo: 'https://assets.coingecko.com/coins/images/17654/small/yieldyak.png?1665824438'
	};
}

export async function swap({ chain, signer, rawQuote, from, to }) {
	const fromAddress = await signer.getAddress();

	const routerContract = new ethers.Contract(chainToId[chain], ABI.yieldYakRouter, signer);

	const swapFunc = (() => {
		if (from === ethers.constants.AddressZero) return routerContract.swapNoSplitFromAVAX;
		if (to === ethers.constants.AddressZero) return routerContract.swapNoSplitToAVAX;
		return routerContract.swapNoSplit;
	})();

	const tx = await swapFunc(
		[rawQuote.amounts[0], rawQuote.amounts[rawQuote.amounts.length - 1], rawQuote.path, rawQuote.adapters],
		fromAddress,
		0,
		from === ethers.constants.AddressZero ? { value: rawQuote.amounts[0] } : {}
	);

	return tx;
}
