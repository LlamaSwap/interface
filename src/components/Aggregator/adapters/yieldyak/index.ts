import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { providers } from '../../rpcs';
import { sendTx } from '../../utils/sendTx';
import { ABI } from './abi';

// Source https://github.com/yieldyak/yak-aggregator
export const chainToId = {
	avax: '0xC4729E56b831d74bBc18797e0e17A295fA77488c',
	canto : '0xE9A2a22c92949d52e963E43174127BEb50739dcF',
};

export const name = 'YieldYak';
export const token = 'YAK';

export function approvalAddress(chain: string) {
	return chainToId[chain];
}

const nativeToken = {
	avax: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
	canto: '0x826551890dc65655a0aceca109ab11abdbd7a07b'
}

export async function getQuote(chain: string, from: string, to: string, amount: string, extra: any) {
	const provider = providers[chain];
	const routerContract = new ethers.Contract(chainToId[chain], ABI.yieldYakRouter, provider);
	const tokenFrom = from === ethers.constants.AddressZero ? nativeToken[chain] : from;
	const tokenTo = to === ethers.constants.AddressZero ? nativeToken[chain] : to;

	const gasPrice = ethers.BigNumber.from(extra.gasPriceData.gasPrice);

	const data = await routerContract.findBestPathWithGas(amount, tokenFrom, tokenTo, 3, gasPrice);

	const gas = data.gasEstimate.add(21000);

	return {
		amountReturned: data[0][data[0].length - 1].toString(),
		estimatedGas: gas.toString(), // Gas estimates only include gas-cost of swapping and querying on adapter and not intermediate logic.
		rawQuote: data,
		tokenApprovalAddress: chainToId[chain],
		logo: 'https://assets.coingecko.com/coins/images/17654/small/yieldyak.png?1665824438'
	};
}

export async function swap({ chain, signer, rawQuote, from, to }) {
	const fromAddress = await signer.getAddress();

	const routerContract = new ethers.Contract(chainToId[chain], ABI.yieldYakRouter, signer).populateTransaction;

	const swapFunc = (() => {
		if (from === ethers.constants.AddressZero) return routerContract.swapNoSplitFromAVAX;
		if (to === ethers.constants.AddressZero) return routerContract.swapNoSplitToAVAX;
		return routerContract.swapNoSplit;
	})();

	const tx = await swapFunc(
		[rawQuote[0][0], rawQuote[0][rawQuote[0].length - 1], rawQuote[2], rawQuote[1]],
		fromAddress,
		0,
		from === ethers.constants.AddressZero ? { value: rawQuote[0][0] } : {}
	);

	const res = await sendTx(signer, chain, tx);

	return res;
}
