import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { applyArbitrumFees } from '../utils/arbitrumFees';
import { ExtraData } from '../types';
import { sendTx } from '../utils/sendTx';

// https://docs.kyberswap.com/Aggregator/aggregator-api#tag/swap/operation/get-route-encode
export const chainToId = {
	ethereum: 'ethereum',
	bsc: 'bsc',
	polygon: 'polygon',
	optimism: 'optimism',
	arbitrum: 'arbitrum',
	avax: 'avalanche',
	fantom: 'fantom',
	aurora: 'aurora',
	bttc: 'bttc',
	cronos: 'cronos',
	oasis: 'oasis',
	velas: 'velas'
};

export const name = 'KyberSwap';
export const token = 'KNC';

export function approvalAddress() {
	return '0x00555513Acf282B42882420E5e5bA87b44D8fA6E';
}

const nativeToken = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

export async function getQuote(chain: string, from: string, to: string, amount: string, extra: ExtraData) {
	const tokenFrom = from === ethers.constants.AddressZero ? nativeToken : from;
	const tokenTo = to === ethers.constants.AddressZero ? nativeToken : to;

	const data = await fetch(
		`https://aggregator-api.kyberswap.com/${
			chainToId[chain]
		}/route/encode?tokenIn=${tokenFrom}&tokenOut=${tokenTo}&amountIn=${amount}&to=${
			extra.userAddress
		}&saveGas=0&gasInclude=0&slippageTolerance=${+extra.slippage * 100 || 50}&clientData={"source":"DefiLlama"}`,
		{
			headers: {
				'Accept-Version': 'Latest'
			}
		}
	).then((r) => r.json());

	let gas = data.totalGas;

	if (chain === 'optimism') gas = BigNumber(3.5).times(gas).toFixed(0, 1);
	if (chain === 'arbitrum') gas = await applyArbitrumFees(data.routerAddress, data.encodedSwapData, gas);

	return {
		amountReturned: data.outputAmount,
		estimatedGas: gas,
		tokenApprovalAddress: data.routerAddress,
		rawQuote: { ...data, gasLimit: gas },
		logo: 'https://assets.coingecko.com/coins/images/14899/small/RwdVsGcw_400x400.jpg?1618923851'
	};
}

export async function swap({ signer, from, rawQuote, chain }) {
	const fromAddress = await signer.getAddress();

	const transactionOption: Record<string, string> = {
		from: fromAddress,
		to: rawQuote.routerAddress,
		data: rawQuote.encodedSwapData,
		...(chain === 'optimism' && { gasLimit: rawQuote.gasLimit })
	};

	if (from === ethers.constants.AddressZero) transactionOption.value = rawQuote.inputAmount;

	const tx = await sendTx(signer, chain, transactionOption);

	return tx;
}
export const getTxData = ({ rawQuote }) => rawQuote?.encodedSwapData;

export const getTx = ({ rawQuote }) => ({
	to: rawQuote.routerAddress,
	data: rawQuote.encodedSwapData
});
