import { CurrencyAmount, Ether, Percent, Token, TradeType, WETH9 } from '@uniswap/sdk-core';
import {
	AlphaRouter,
	ChainId,
	SwapOptionsSwapRouter02,
	SwapType,
	SWAP_ROUTER_02_ADDRESS
} from '@uniswap/smart-order-router';
import JSBI from 'jsbi';
import { ethers } from 'ethers';
import { providers } from '../../rpcs';
import { sendTx } from '../../utils/sendTx';
import { applyArbitrumFees } from '../../utils/arbitrumFees';
import BigNumber from 'bignumber.js';

WETH9[137] = new Token(137, '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270', 18, 'WMATIC', 'Wrapped Matic');

export const chainToId = {
	ethereum: ChainId.MAINNET,
	polygon: ChainId.POLYGON,
	arbitrum: ChainId.ARBITRUM_ONE,
	optimism: ChainId.OPTIMISM
};

export const name = 'Uniswap';
export const token = 'UNI';

export function fromReadableAmount(amount: string, decimals: number): JSBI {
	const value = ethers.utils.parseUnits(amount, decimals);

	return JSBI.BigInt(value);
}

export const uniToken = (address, decimals, chain) => {
	if (address === ethers.constants.AddressZero) return Ether.onChain(chainToId[chain]);
	return new Token(chainToId[chain], address, decimals);
};

export async function getQuote(chain: string, from: string, to: string, _: string, extra) {
	const fromToken = uniToken(from, extra.fromToken.decimals, chain);
	const toToken = uniToken(to, extra.toToken.decimals, chain);

	const router = new AlphaRouter({
		chainId: chainToId[chain],
		provider: providers[chain]
	});

	const options: SwapOptionsSwapRouter02 = {
		recipient: extra.userAddress,
		slippageTolerance: new Percent(+extra.slippage * 1000, 100000),
		deadline: Math.floor(Date.now() / 1000 + 1800),
		type: SwapType.SWAP_ROUTER_02
	};

	const route = await router.route(
		CurrencyAmount.fromRawAmount(fromToken, fromReadableAmount(extra.amount, extra.fromToken.decimals).toString()),
		toToken,
		TradeType.EXACT_INPUT,
		options
	);

	let gas = route.estimatedGasUsed.toString();
	if (chain === 'arbitrum')
		gas =
			route === null ? null : await applyArbitrumFees(route.methodParameters.to, route.methodParameters.calldata, gas);
	if (chain === 'optimism') gas = BigNumber(7).times(gas).toFixed(0, 1);
	return {
		amountReturned: +route.trade.outputAmount.toExact() * 10 ** extra.toToken.decimals,
		estimatedGas: gas,
		tokenApprovalAddress: SWAP_ROUTER_02_ADDRESS,
		rawQuote: {
			tx: {
				data: route.methodParameters.calldata,
				value: route.methodParameters.value,
				to: route.methodParameters.to
			},
			gasLimit: gas
		}
	};
}

export async function swap({ chain, signer, rawQuote }) {
	const fromAddress = await signer.getAddress();

	const tx = await sendTx(signer, chain, {
		from: fromAddress,
		...rawQuote.tx,
		...(chain === 'optimism' && { gasLimit: rawQuote.gasLimit })
	});

	return tx;
}

export const getTxData = ({ rawQuote }) => rawQuote?.tx?.data;

export const getTx = ({ rawQuote }) => ({
	to: rawQuote?.tx?.to,
	data: rawQuote?.tx?.data,
	value: rawQuote?.tx?.value
});
