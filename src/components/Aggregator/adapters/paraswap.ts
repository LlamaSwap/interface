// Source: https://developers.paraswap.network/api/master

import { ethers, Signer } from 'ethers';

// api docs have an outdated chain list, need to check https://app.paraswap.io/# to find supported networks
export const chainToId = {
	ethereum: 1,
	bsc: 56,
	polygon: 137,
	avax: 43114,
	arbitrum: 42161,
	fantom: 250
};

export const name = 'ParaSwap';
export const token = 'PSP';

export function approvalAddress() {
	return '0x216b4b4ba9f3e719726886d34a177484278bfcae';
}
const nativeToken = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
export async function getQuote(
	chain: string,
	from: string,
	to: string,
	amount: string,
	{ fromToken, toToken, userAddress }
) {
	// ethereum = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE
	// amount should include decimals

	const tokenFrom = from === ethers.constants.AddressZero ? nativeToken : from;
	const tokenTo = to === ethers.constants.AddressZero ? nativeToken : to;
	const data = await fetch(
		`https://apiv5.paraswap.io/prices/?srcToken=${tokenFrom}&destToken=${tokenTo}&amount=${amount}&srcDecimals=${fromToken?.decimals}&destDecimals=${toToken?.decimals}&side=SELL&network=${chainToId[chain]}`
	).then((r) => r.json());

	const dataSwap =
		userAddress !== ethers.constants.AddressZero
			? await fetch(`https://apiv5.paraswap.io/transactions/${chainToId[chain]}`, {
					method: 'POST',
					body: JSON.stringify({
						srcToken: data.priceRoute.srcToken,
						srcDecimals: data.priceRoute.srcDecimals,
						destToken: data.priceRoute.destToken,
						destDecimals: data.priceRoute.destDecimals,
						srcAmount: data.priceRoute.srcAmount,
						destAmount: data.priceRoute.destAmount,
						userAddress: userAddress,
						txOrigin: userAddress,
						deadline: Math.floor(Date.now() / 1000) + 300,
						priceRoute: data.priceRoute
					}),
					headers: {
						'Content-Type': 'application/json'
					}
			  }).then((r) => r.json())
			: null;
	return {
		amountReturned: data.priceRoute.destAmount,
		estimatedGas: data.priceRoute.gasCost,
		tokenApprovalAddress: data.priceRoute.tokenTransferProxy,
		rawQuote: dataSwap,
		logo: 'https://assets.coingecko.com/coins/images/20403/small/ep7GqM19_400x400.jpg?1636979120'
	};
}

export async function swap({ signer, rawQuote }) {
	const tx = await signer.sendTransaction({
		from: rawQuote.from,
		to: rawQuote.to,
		data: rawQuote.data,
		value: rawQuote.value,
		gasPrice: rawQuote.gasPrice
	});
	return tx;
}

export const getTxData = ({ rawQuote }) => rawQuote?.data;
