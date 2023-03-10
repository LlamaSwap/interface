// Source: https://developers.paraswap.network/api/master

import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { applyArbitrumFees } from '../utils/arbitrumFees';
import { sendTx } from '../utils/sendTx';
import { defillamaReferrerAddress } from '../constants';

// api docs have an outdated chain list, need to check https://app.paraswap.io/# to find supported networks
export const chainToId = {
	ethereum: 1,
	bsc: 56,
	polygon: 137,
	avax: 43114,
	arbitrum: 42161,
	fantom: 250,
	optimism: 10
};

export const name = 'ParaSwap';
export const token = 'PSP';
export const partner = 'llamaswap';


export function approvalAddress() {
	return '0x216b4b4ba9f3e719726886d34a177484278bfcae';
}
const nativeToken = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
export async function getQuote(
	chain: string,
	from: string,
	to: string,
	amount: string,
	{ fromToken, toToken, userAddress, slippage }
) {
	// ethereum = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE
	// amount should include decimals

	const tokenFrom = from === ethers.constants.AddressZero ? nativeToken : from;
	const tokenTo = to === ethers.constants.AddressZero ? nativeToken : to;
	const data = await fetch(
		`https://apiv5.paraswap.io/prices/?srcToken=${tokenFrom}&destToken=${tokenTo}&amount=${amount}&srcDecimals=${fromToken?.decimals}&destDecimals=${toToken?.decimals}&partner=${partner}&side=SELL&network=${chainToId[chain]}&excludeDEXS=ParaSwapPool,ParaSwapLimitOrders`
	).then((r) => r.json());

	const dataSwap =
		userAddress !== ethers.constants.AddressZero
			? await fetch(`https://apiv5.paraswap.io/transactions/${chainToId[chain]}?ignoreChecks=true`, {
					method: 'POST',
					body: JSON.stringify({
						srcToken: data.priceRoute.srcToken,
						srcDecimals: data.priceRoute.srcDecimals,
						destToken: data.priceRoute.destToken,
						destDecimals: data.priceRoute.destDecimals,
						srcAmount: data.priceRoute.srcAmount,
						slippage: slippage * 100,
						userAddress: userAddress,
						//txOrigin: userAddress,
						//deadline: Math.floor(Date.now() / 1000) + 300,
						partner: partner,
						partnerAddress: defillamaReferrerAddress,
						positiveSlippageToUser: false,
						priceRoute: data.priceRoute
					}),
					headers: {
						'Content-Type': 'application/json'
					}
			  }).then((r) => r.json())
			: null;

	let gas = data.priceRoute.gasCost;

	if (chain === 'optimism') gas = BigNumber(3.5).times(gas).toFixed(0, 1);

	if (chain === 'arbitrum') {
		gas = await applyArbitrumFees(dataSwap.to, dataSwap.data, gas);
	}

	return {
		amountReturned: data.priceRoute.destAmount,
		estimatedGas: gas,
		tokenApprovalAddress: data.priceRoute.tokenTransferProxy,
		rawQuote: { ...dataSwap, gasLimit: gas },
		logo: 'https://assets.coingecko.com/coins/images/20403/small/ep7GqM19_400x400.jpg?1636979120'
	};
}

export async function swap({ signer, rawQuote, chain }) {
	const tx = await sendTx(signer, chain, {
		from: rawQuote.from,
		to: rawQuote.to,
		data: rawQuote.data,
		value: rawQuote.value,
		...(chain === 'optimism' && { gasLimit: rawQuote.gasLimit })
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
