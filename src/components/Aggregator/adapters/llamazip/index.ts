import { sendTx } from '../../utils/sendTx';
import { encode } from './encode';
import { normalizeTokens, pairs } from './pairs';
import { zeroAddress } from 'viem';
import { simulateContract } from 'wagmi/actions';
import { config } from '../../../WalletProvider';
import { chainsMap } from '../../constants';

export const name = 'LlamaZip';
export const token = 'none';

export const chainToId = {
	optimism: '0x6f9d14Cf4A06Dd9C70766Bd161cf8d4387683E1b',
	arbitrum: '0x973bf562407766e77f885c1cd1a8060e5303C745'
};

// https://docs.uniswap.org/contracts/v3/reference/deployments
const quoter = {
	optimism: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
	arbitrum: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6'
};

const weth = {
	optimism: '0x4200000000000000000000000000000000000006',
	arbitrum: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'
};

function normalize(token: string, weth: string) {
	return (token === zeroAddress ? weth : token).toLowerCase();
}

// https://docs.uniswap.org/sdk/v3/guides/quoting
export async function getQuote(chain: string, from: string, to: string, amount: string, extra: any) {
	if (to.toLowerCase() === weth[chain].toLowerCase()) {
		return null; // We don't support swaps to WETH
	}

	const tokenFrom = normalize(from, weth[chain]);
	const tokenTo = normalize(to, weth[chain]);

	const token0isTokenIn = BigInt(tokenFrom) < BigInt(tokenTo);

	const possiblePairs = pairs[chain as keyof typeof pairs].filter(
		({ name }) => name === normalizeTokens(tokenFrom, tokenTo).join('-')
	);

	if (possiblePairs.length === 0) {
		return null;
	}

	const quotedAmountOuts = (
		await Promise.all(
			possiblePairs.map(async (pair) => {
				try {
					// const callData = encodeFunctionData({})
					return {
						output: (
							await simulateContract(config, {
								address: quoter[chain],
								abi: [
									{
										inputs: [
											{ internalType: 'address', name: 'tokenIn', type: 'address' },
											{ internalType: 'address', name: 'tokenOut', type: 'address' },
											{ internalType: 'uint24', name: 'fee', type: 'uint24' },
											{ internalType: 'uint256', name: 'amountIn', type: 'uint256' },
											{ internalType: 'uint160', name: 'sqrtPriceLimitX96', type: 'uint160' }
										],
										name: 'quoteExactInputSingle',
										outputs: [{ internalType: 'uint256', name: 'amountOut', type: 'uint256' }],
										stateMutability: 'nonpayable',
										type: 'function'
									}
								],
								functionName: 'quoteExactInputSingle',
								args: [tokenFrom as `0x${string}`, tokenTo as `0x${string}`, Number(pair.fee), BigInt(amount), 0n],
								chainId: chainsMap[chain]
							})
						).result,
						pair
					};
				} catch (e) {
					console.log({ e });
					if (pair.mayFail === true) return null;
					throw e;
				}
			})
		)
	).filter((t) => t !== null);

	const bestPair = quotedAmountOuts.sort((a, b) => (b!.output > a!.output ? 1 : -1))[0];
	const pair = bestPair!.pair;
	const quotedAmountOut = bestPair!.output.toString();

	const inputIsETH = from === zeroAddress;
	const calldata = encode(pair.pairId, token0isTokenIn, quotedAmountOut, extra.slippage, inputIsETH, false, amount);
	if (calldata.length > 256 / 4 + 2) {
		return null; // LlamaZip doesn't support calldata that's bigger than one EVM word
	}

	return {
		amountReturned: quotedAmountOut.toString(),
		estimatedGas: (200e3).toString(), // random approximation
		rawQuote: {
			tx: {
				to: chainToId[chain],
				data: calldata,
				...(inputIsETH ? { value: amount } : {})
			}
		},
		tokenApprovalAddress: chainToId[chain],
		logo: 'https://raw.githubusercontent.com/DefiLlama/memes/master/bussin.jpg'
	};
}

export async function swap({ fromAddress, rawQuote }) {
	const tx = await sendTx({
		from: fromAddress,
		to: rawQuote.tx.to,
		data: rawQuote.tx.data,
		value: rawQuote.tx.value
	});
	return tx;
}

export const getTxData = ({ rawQuote }) => rawQuote?.tx?.data;

export const getTx = ({ rawQuote }) => rawQuote?.tx;
