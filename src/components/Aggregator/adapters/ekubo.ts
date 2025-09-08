import { sendTx } from '../utils/sendTx';
import { getTxs } from '../utils/getTxs';
import { zeroAddress, pad, Hex } from 'viem';
import { MAINNET_ADDRESS, MultiHop, Parameters, generateCalldata } from '@ekubo/evm-hyper-router-sdk';

export const chainToId = {
	ethereum: 1,
};

export const name = 'Ekubo';
export const token = 'EKUBO';
export const referral = false;
export const isOutputAvailable = true;

const logo = 'https://app.ekubo.org/logo.svg';

export function approvalAddress(chain: string) {
	if (chain === 'ethereum') return MAINNET_ADDRESS;
	throw new Error('Ekubo: unsupported network');
}

export function ekuboApiEndpoint(chain: string) {
	if (chain === 'ethereum') return 'https://eth-mainnet-quoter-api.ekubo.org';
	throw new Error('Ekubo: unsupported network');
}

function normalizeAddress(address: string): Hex {
	if (address === zeroAddress) return zeroAddress;
	return pad(address as Hex, { size: 20 });
}

function normalizeConfig(config: string): Hex {
	return pad(config as Hex, { size: 32 });
}

export async function getQuote(chain: string, from: string, to: string, amount: string, extra) {
	const ekuboRouter = approvalAddress(chain);
	const quoterEndpoint = ekuboApiEndpoint(chain);
	const isExactOut = extra.amountOut && extra.amountOut !== '0';
	
	// Call Ekubo API - for exact out, we swap the tokens and negate the amount
	const apiUrl = isExactOut 
		? `${quoterEndpoint}/-${extra.amountOut}/${to}/${from}`
		: `${quoterEndpoint}/${amount}/${from}/${to}`;
	
	const data = await fetch(apiUrl).then((r) => r.json());
	
	if (!data.splits || data.splits.length === 0) {
		throw new Error('[Ekubo] No valid routes found');
	}

	const multiHops: MultiHop[] = data.splits.map(split => {
		return {
			specifiedAmount: BigInt(split.amount_specified),
			hops: split.route.map(hop => {
				if (hop.swap) {
					return {
						type: "swap",
						poolKey: {
							config: normalizeConfig(hop.swap.pool_key.config),
							token0: normalizeAddress(hop.swap.pool_key.token0),
							token1: normalizeAddress(hop.swap.pool_key.token1)
						},
						skipAhead: hop.swap.skip_ahead,
						sqrtRatioLimit: BigInt(hop.swap.sqrt_ratio_limit)
					}
				} else {
					return {
						type: "wrappedToken",
						underlying: normalizeAddress(hop.wrapped_token.underlying),
						wrapped: normalizeAddress(hop.wrapped_token.wrapped)
					}
				}
			})
		}
	})

	const slippageFactor = extra.slippage ? parseFloat(extra.slippage) / 100 : 0.001;
	
	let amountReturned, amountIn, calculatedAmountThreshold;

	// Apply slippage
	if (isExactOut) {
		// For exact out, amountIn is adjusted upwards
		// total_calculated and calculatedAmountThreshold should be negative
		amountIn = BigInt(Math.floor(Math.abs(data.total_calculated))).toString();
		amountReturned = extra.amountOut;
		calculatedAmountThreshold = -BigInt(Math.ceil(amountIn * (1 + slippageFactor)));
	} else {
		// For exact in, amountReturned is adjusted downwards
		amountIn = amount;
		amountReturned = data.total_calculated;
		calculatedAmountThreshold = BigInt(Math.floor(amountReturned * (1 - slippageFactor)));
	}

	const calldata = generateCalldata({
		specifiedToken: isExactOut ? to : from,
		multiHops: multiHops,
		calculatedAmountThreshold
	} as Parameters);

	const rawQuote = extra.userAddress !== zeroAddress ? {
		from: extra.userAddress,
		to: ekuboRouter,
		data: calldata,
		value: from === zeroAddress ? (isExactOut ? -calculatedAmountThreshold : amountIn) : '0'
	} : null;

	// Base transaction costs + swap execution + token transfers
	const estimatedGas = 21000 + data.estimated_gas_cost + (from === zeroAddress ? 0 : 30000) + (to === zeroAddress ? 0 : 30000);

	const result = {
		amountIn,
		amountReturned,
		estimatedGas,
		tokenApprovalAddress: ekuboRouter,
		rawQuote,
		logo
	};
	
	return result;
}

export async function swap({ tokens, fromAmount, rawQuote, eip5792 }) {
	const txs = getTxs({
		fromAddress: rawQuote.from,
		routerAddress: rawQuote.to,
		data: rawQuote.data,
		value: rawQuote.value,
		fromTokenAddress: tokens.fromToken.address,
		fromAmount,
		eip5792,
		tokenApprovalAddress: rawQuote.to
	});

	const tx = await sendTx(txs);

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
