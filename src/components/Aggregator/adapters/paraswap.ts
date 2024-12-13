// Source: https://developers.paraswap.network/api/master

import BigNumber from 'bignumber.js';
import { applyArbitrumFees } from '../utils/arbitrumFees';
import { sendTx } from '../utils/sendTx';
import { defillamaReferrerAddress } from '../constants';
import { zeroAddress } from 'viem';

// api docs have an outdated chain list, need to check https://app.paraswap.io/# to find supported networks
export const chainToId = {
	ethereum: 1,
	bsc: 56,
	polygon: 137,
	avax: 43114,
	arbitrum: 42161,
	fantom: 250,
	optimism: 10,
	polygonzkevm: 1101,
	base: 8453,
	gnosis: 100
};

const approvers = {
	ethereum: "0x6a000f20005980200259b80c5102003040001068",
	bsc: "0x6a000f20005980200259b80c5102003040001068",
	polygon: "0x6a000f20005980200259b80c5102003040001068",
	avax: "0x6a000f20005980200259b80c5102003040001068",
	arbitrum: "0x6a000f20005980200259b80c5102003040001068",
	fantom: "0x6a000f20005980200259b80c5102003040001068",
	optimism: "0x6a000f20005980200259b80c5102003040001068",
	polygonzkevm: "0x6a000f20005980200259b80c5102003040001068",
	base: "0x6a000f20005980200259b80c5102003040001068",
	gnosis: "0x6a000f20005980200259b80c5102003040001068"
}

export const name = 'ParaSwap';
export const token = 'PSP';
export const partner = 'llamaswap';
export const isOutputAvailable = true;

export function approvalAddress() {
	return '0x216b4b4ba9f3e719726886d34a177484278bfcae';
}
const nativeToken = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
export async function getQuote(
	chain: string,
	from: string,
	to: string,
	amount: string,
	{ fromToken, toToken, userAddress, slippage, amountOut }
) {
	// ethereum = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE
	// amount should include decimals

	const tokenFrom = from === zeroAddress ? nativeToken : from;
	const tokenTo = to === zeroAddress ? nativeToken : to;
	const side = amountOut && amountOut !== '0' ? 'BUY' : 'SELL';
	const finalAmount = side === 'BUY' ? amountOut : amount;
	const data = await fetch(
		`https://apiv5.paraswap.io/prices/?srcToken=${tokenFrom}&destToken=${tokenTo}&amount=${finalAmount}&srcDecimals=${fromToken?.decimals}&destDecimals=${toToken?.decimals}&partner=${partner}&side=${side}&network=${chainToId[chain]}&excludeDEXS=ParaSwapPool,ParaSwapLimitOrders&version=6.2`
	).then((r) => r.json());

	const dataSwap =
		userAddress !== zeroAddress
			? await fetch(`https://apiv5.paraswap.io/transactions/${chainToId[chain]}?ignoreChecks=true`, {
					method: 'POST',
					body: JSON.stringify({
						srcToken: data.priceRoute.srcToken,
						srcDecimals: data.priceRoute.srcDecimals,
						destToken: data.priceRoute.destToken,
						destDecimals: data.priceRoute.destDecimals,
						slippage: slippage * 100,
						userAddress: userAddress,
						partner: partner,
						partnerAddress: defillamaReferrerAddress,
						takeSurplus: true,
						priceRoute: data.priceRoute,
						isCapSurplus: true,
						...(side === 'BUY' ? { destAmount: data.priceRoute.destAmount } : { srcAmount: data.priceRoute.srcAmount })
					}),
					headers: {
						'Content-Type': 'application/json'
					}
				}).then((r) => r.json())
			: null;

	if (dataSwap?.error) {
		throw new Error(dataSwap.error)
	}

	let gas = data.priceRoute.gasCost;

	if (chain === 'optimism') gas = BigNumber(3.5).times(gas).toFixed(0, 1);

	if (chain === 'arbitrum' && dataSwap) {
		gas = await applyArbitrumFees(dataSwap.to, dataSwap.data, gas);
	}

	if(data.priceRoute.tokenTransferProxy.toLowerCase() !== approvers[chain].toLowerCase()){
		throw new Error("Approval address doesn't match")
	}

	return {
		amountReturned: data.priceRoute.destAmount,
		amountIn: data.priceRoute.srcAmount || 0,
		estimatedGas: gas,
		tokenApprovalAddress: data.priceRoute.tokenTransferProxy,
		rawQuote: { ...dataSwap, gasLimit: gas },
		logo: 'https://assets.coingecko.com/coins/images/20403/small/ep7GqM19_400x400.jpg?1636979120'
	};
}

export async function swap({ rawQuote, chain }) {
	const tx = await sendTx({
		from: rawQuote.from,
		to: rawQuote.to,
		data: rawQuote.data,
		value: rawQuote.value,
		...(chain === 'optimism' && { gas: rawQuote.gasLimit })
	});

	return tx;
}

export const getTxData = ({ rawQuote }) => rawQuote?.data;

export const getTx = ({ rawQuote }) => ({
	from: rawQuote.from,
	to: rawQuote.to,
	data: rawQuote.data,
	value: rawQuote.value
});
