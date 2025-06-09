import { sendTx } from '../../utils/sendTx';
import { zeroAddress, encodeFunctionData, pad } from 'viem';
import { ekuboRouterAbi } from './abi';

export const chainToId = {
	ethereum: 1,
};

export const name = 'Ekubo';
export const token = 'EKUBO';
export const referral = false;
export const isOutputAvailable = true;
const logo = 'https://assets.coingecko.com/coins/images/37715/standard/135474885.png?1715330450';

export function approvalAddress(chain: string) {
	if (chain == 'ethereum') return '0x9995855C00494d039aB6792f18e368e530DFf931';
	throw new Error('Ekubo: unsupported network');
}

export function ekuboApiEndpoint(chain: string) {
	if (chain == 'ethereum') return 'https://eth-mainnet-quoter-api.ekubo.org';
	throw new Error('Ekubo: unsupported network');
}

function normalizeAddress(address: string): `0x${string}` {
	if (address === zeroAddress) return zeroAddress;
	return pad(address as `0x${string}`, { size: 20 });
}

function normalizeConfig(config: string): `0x${string}` {
	return pad(config as `0x${string}`, { size: 32 });
}

type Route = {
	pool_key: {
		config: string,
		token0: string,
		token1: string
	},
	skip_ahead: 0,
	sqrt_ratio_limit: string
}

type Split = {
	amount_calculated: string,
	amount_specified: string,
	route: Route[]
}

export function assembleSwapData(splits: Split[], fromToken: `0x${string}`, amountIn: string, calculatedAmountThreshold: string) {
	if (splits.length == 1) {
		const split = splits[0];
		if (split.route.length == 1) {
			// Single hop swap: swap(RouteNode memory node, TokenAmount memory tokenAmount, int256 calculatedAmountThreshold)
			const route = split.route[0];
			return encodeFunctionData({
				abi: ekuboRouterAbi,
				functionName: 'swap',
				args: [
					{
						poolKey: {
							token0: normalizeAddress(route.pool_key.token0),
							token1: normalizeAddress(route.pool_key.token1),
							config: normalizeConfig(route.pool_key.config)
						},
						sqrtRatioLimit: BigInt(route.sqrt_ratio_limit),
						skipAhead: BigInt(route.skip_ahead)
					},
					{
						token: fromToken,
						amount: BigInt(amountIn)
					},
					BigInt(calculatedAmountThreshold)
				]
			});
		} else {
			// Multi-hop swap: multihopSwap(Swap memory s, int256 calculatedAmountThreshold)
			const routeNodes = split.route.map(route => ({
				poolKey: {
					token0: normalizeAddress(route.pool_key.token0),
					token1: normalizeAddress(route.pool_key.token1),
					config: normalizeConfig(route.pool_key.config)
				},
				sqrtRatioLimit: BigInt(route.sqrt_ratio_limit),
				skipAhead: BigInt(route.skip_ahead)
			}));

			return encodeFunctionData({
				abi: ekuboRouterAbi,
				functionName: 'multihopSwap',
				args: [
					{
						route: routeNodes,
						tokenAmount: {
							token: fromToken,
							amount: BigInt(amountIn)
						}
					},
					BigInt(calculatedAmountThreshold)
				]
			});
		}
	} else {
		// Multi split swap: multiMultihopSwap(Swap[] memory swaps, int256 calculatedAmountThreshold)
		const swaps = splits.map(split => ({
			route: split.route.map(route => ({
				poolKey: {
					token0: normalizeAddress(route.pool_key.token0),
					token1: normalizeAddress(route.pool_key.token1),
					config: normalizeConfig(route.pool_key.config)
				},
				sqrtRatioLimit: BigInt(route.sqrt_ratio_limit),
				skipAhead: BigInt(route.skip_ahead)
			})),
			tokenAmount: {
				token: fromToken,
				amount: BigInt(split.amount_specified)
			}
		}));

		return encodeFunctionData({
			abi: ekuboRouterAbi,
			functionName: 'multiMultihopSwap',
			args: [
				swaps,
				BigInt(calculatedAmountThreshold)
			]
		});
	}
}

async function getQuoteExactIn(chain: string, fromToken: `0x${string}`, toToken: `0x${string}`, amount: string, { userAddress, slippage }) {
	const ekuboRouter = approvalAddress(chain);
	const quoterEndpoint = ekuboApiEndpoint(chain);

	const data = await fetch(`${quoterEndpoint}/${amount}/${fromToken}/${toToken}`).then((r) => r.json());

	if (!data.splits || data.splits.length === 0) {
		throw new Error('No valid routes found');
	}

	// Calculate slippage threshold (assuming 0.01% default slippage if not provided)
	const slippageFactor = slippage !== undefined ? slippage / 100 : 0.0001;
	const calculatedAmountThreshold = Math.floor(parseInt(data.total_calculated) * (1 - slippageFactor)).toString();

	// Generate swap transaction data
	const swapData = assembleSwapData(data.splits, fromToken, amount, calculatedAmountThreshold);

	const rawQuote = userAddress !== zeroAddress ? {
		from: userAddress,
		to: ekuboRouter,
		data: swapData,
		value: fromToken === zeroAddress ? amount : 0
	} : null;

	return {
		amountIn: amount,
		amountReturned: data.total_calculated,
		estimatedGas: data.estimated_gas_cost,
		tokenApprovalAddress: ekuboRouter,
		rawQuote,
		logo
	};
}

export async function getQuoteExactOut(chain: string, fromToken: `0x${string}`, toToken: `0x${string}`, amount: string, { userAddress, slippage, amountOut }) {
	const ekuboRouter = approvalAddress(chain);
	const quoterEndpoint = ekuboApiEndpoint(chain);

	const data = await fetch(`${quoterEndpoint}/-${amountOut}/${toToken}/${fromToken}`).then((r) => r.json());

	if (!data.splits || data.splits.length === 0) {
		throw new Error('No valid routes found');
	}

	// Calculate slippage threshold (assuming 0.01% default slippage if not provided)
	const amountIn = -1 * parseInt(data.total_calculated)
	const slippageFactor = slippage !== undefined ? slippage / 100 : 0.0001;
	const calculatedAmountThreshold = Math.ceil(amountIn * (1 + slippageFactor)).toString();

	// Generate swap transaction data
	const swapData = assembleSwapData(data.splits, toToken, `-${amountOut}`, `-${calculatedAmountThreshold}`);

	let finalData = swapData;

	// Use multicall for exactAmountOut with refund ETH only if fromToken is ETH
	if (fromToken === zeroAddress) {
		const refundETHData = encodeFunctionData({
			abi: ekuboRouterAbi,
			functionName: 'refundNativeToken',
			args: []
		});
		finalData = encodeFunctionData({
			abi: ekuboRouterAbi,
			functionName: 'multicall',
			args: [[swapData, refundETHData]]
		});
	}

	const rawQuote = userAddress !== zeroAddress ? {
		from: userAddress,
		to: ekuboRouter,
		data: finalData,
		value: fromToken === zeroAddress ? calculatedAmountThreshold : 0
	} : null;

	return {
		amountIn: amountIn.toString(),
		amountReturned: amountOut,
		estimatedGas: data.estimated_gas_cost,
		tokenApprovalAddress: ekuboRouter,
		rawQuote,
		logo
	};
}

export async function getQuote(chain: string, fromToken: `0x${string}`, toToken: `0x${string}`, amount: string, extras) {
	const isExactOut = extras.amountOut && extras.amountOut !== '0';
	if (isExactOut) {
		return getQuoteExactOut(chain, fromToken, toToken, amount, extras);
	} else {
		return getQuoteExactIn(chain, fromToken, toToken, amount, extras);
	}
}

export async function swap({ rawQuote }) {
	if (!rawQuote) {
		throw new Error('No swap data available');
	}

	const txObject = {
		from: rawQuote.from,
		to: rawQuote.to,
		data: rawQuote.data,
		value: rawQuote.value
	};

	const tx = await sendTx(txObject);
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
	};
};