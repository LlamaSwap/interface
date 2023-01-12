// Source https://docs.1inch.io/docs/aggregation-protocol/api/swagger

import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { providers } from '../rpcs';

export const chainToId = {
	ethereum: 'ETH',
	bsc: 'BSC',
	polygon: 'POLYGON',
	optimism: 'OPTIMISM',
	arbitrum: 'ARBITRUM',
	gnosis: 'GNOSIS',
	avax: 'AVAX_CCHAIN',
	fantom: 'FANTOM',
	aurora: 'AURORA'
};

export const name = 'Rango';
export const token = null;

export async function getQuote(
	chain: string,
	from: string,
	to: string,
	amount: string,
	{ userAddress, fromToken, toToken, slippage }
) {
	// ethereum = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE
	// amount should include decimals

	const tokenFrom =
		fromToken.address === ethers.constants.AddressZero
			? `${chainToId[chain]}.${fromToken.symbol}`
			: `${chainToId[chain]}.${fromToken.symbol}--${fromToken.address}`;
	const tokenTo =
		toToken.address === ethers.constants.AddressZero
			? `${chainToId[chain]}.${toToken.symbol}`
			: `${chainToId[chain]}.${toToken.symbol}--${toToken.address}`;
	const params = new URLSearchParams({
		from: tokenFrom,
		to: tokenTo,
		amount: amount,
		fromAddress: userAddress || ethers.constants.AddressZero,
		toAddress: userAddress || ethers.constants.AddressZero,
		disableEstimate: 'true',
		apiKey: 'c0ed54c0-e85c-4547-8e11-7ff88775b90c',
		slippage: slippage || '1'
	}).toString();

	const data = await fetch(`https://api.rango.exchange/basic/swap?${params}`).then((r) => r.json());

	let estimatedGas;
	try {
		estimatedGas = await providers[chain].estimateGas({
			to: data?.tx?.txTo,
			data: data?.tx?.txData,
			value: data?.tx?.value
		});
	} catch (e) {
		estimatedGas = BigNumber(data?.tx?.gasLimit).toString();
	}

	const gasPrice =
		chain === 'optimism' && estimatedGas ? BigNumber(3.5).times(estimatedGas).toFixed(0, 1) : estimatedGas;

	return {
		amountReturned: data?.route?.outputAmount,
		estimatedGas: gasPrice,
		tokenApprovalAddress: data?.tx?.txTo,
		rawQuote: { ...data, gasLimit: gasPrice },
		logo: ''
	};
}

export async function swap({ signer, rawQuote, chain }) {
	const fromAddress = await signer.getAddress();

	const tx = await signer.sendTransaction({
		from: fromAddress,
		to: rawQuote?.tx?.txTo,
		data: rawQuote?.tx?.txData,
		value: rawQuote?.tx?.value,
		...(chain === 'optimism' && { gasLimit: rawQuote.gasLimit })
	});

	return tx;
}

export const getTxData = ({ rawQuote }) => rawQuote?.tx?.txData;
