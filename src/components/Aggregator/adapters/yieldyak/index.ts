import BigNumber from 'bignumber.js';
import { sendTx } from '../../utils/sendTx';
import { ABI } from './abi';
import { encodeFunctionData, zeroAddress } from 'viem';
import { readContract } from 'wagmi/actions';
import { config } from '../../../WalletProvider';
import { chainsMap } from '../../constants';

// Source https://github.com/yieldyak/yak-aggregator
export const chainToId = {
	avax: '0xC4729E56b831d74bBc18797e0e17A295fA77488c',
	canto: '0xE9A2a22c92949d52e963E43174127BEb50739dcF'
};

export const name = 'YieldYak';
export const token = 'YAK';

export function approvalAddress(chain: string) {
	return chainToId[chain];
}

const nativeToken = {
	avax: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
	canto: '0x826551890dc65655a0aceca109ab11abdbd7a07b'
};

export async function getQuote(chain: string, from: string, to: string, amount: string, extra: any) {
	const tokenFrom = from === zeroAddress ? nativeToken[chain] : from;
	const tokenTo = to === zeroAddress ? nativeToken[chain] : to;

	const gasPrice = extra.gasPriceData?.gasPrice ?? '1062500000000';

	const data = (await readContract(config, {
		address: chainToId[chain],
		abi: ABI,
		functionName: 'findBestPathWithGas',
		args: [amount, tokenFrom, tokenTo, 3, gasPrice],
		chainId: chainsMap[chain]
	})) as {
		amounts: Array<bigint>;
		adapters: Array<`0x${string}`>;
		gasEstimate: bigint;
		path: Array<`0x${string}`>;
	};

	const expectedAmount = data.amounts[data.amounts.length - 1];

	const minAmountOut = BigNumber(expectedAmount.toString())
		.times(1 - Number(extra.slippage) / 100)
		.toFixed(0);

	const gas = data.gasEstimate + 21000n;

	return {
		amountReturned: expectedAmount.toString(),
		estimatedGas: gas.toString(), // Gas estimates only include gas-cost of swapping and querying on adapter and not intermediate logic.
		rawQuote: {
			// convert bigint to string so when we send swap event to our server, app doesn't crash serializing bigint values
			offer: {
				...data,
				amounts: data.amounts.map((amount) => String(amount)),
				gasEstimate: String(data.gasEstimate)
			},
			minAmountOut
		},
		tokenApprovalAddress: chainToId[chain],
		logo: 'https://assets.coingecko.com/coins/images/17654/small/yieldyak.png?1665824438'
	};
}

export async function swap({ chain, fromAddress, rawQuote, from, to }) {
	const data = encodeFunctionData({
		abi: ABI,
		functionName:
			from === zeroAddress ? 'swapNoSplitFromAVAX' : to === zeroAddress ? 'swapNoSplitToAVAX' : 'swapNoSplit',
		args: [
			[rawQuote.offer.amounts[0], rawQuote.minAmountOut, rawQuote.offer.path, rawQuote.offer.adapters],
			fromAddress,
			0
		]
	});

	const tx = {
		to: chainToId[chain],
		data,
		...(from === zeroAddress ? { value: rawQuote.offer.amounts[0] } : {})
	};

	const res = await sendTx(tx);

	return res;
}
