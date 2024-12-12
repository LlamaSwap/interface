import { applyArbitrumFees } from '../utils/arbitrumFees';
import { ExtraData } from '../types';
import { sendTx } from '../utils/sendTx';
import { zeroAddress } from 'viem';

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
	zksync: 'zksync',
	polygonzkevm: 'polygon-zkevm',
	linea: 'linea',
	base: 'base',
	//mantle
	scroll: 'scroll'
	//blast
	//xlayer
};

export const name = 'KyberSwap';
export const token = 'KNC';

export function approvalAddress() {
	return '0x00555513Acf282B42882420E5e5bA87b44D8fA6E';
}

const nativeToken = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
const clientId = "llamaswap"

export async function getQuote(chain: string, from: string, to: string, amount: string, extra: ExtraData) {
	const tokenFrom = from === zeroAddress ? nativeToken : from;
	const tokenTo = to === zeroAddress ? nativeToken : to;

	const quote = await fetch(
		`https://aggregator-api.kyberswap.com/${
			chainToId[chain]
		}/api/v1/routes?tokenIn=${tokenFrom}&tokenOut=${tokenTo}&amountIn=${amount}&gasInclude=true`,
		{
			headers: {
				'x-client-id': clientId
			}
		}
	).then((r) => r.json());

	const tx = await fetch(
		`https://aggregator-api.kyberswap.com/${chainToId[chain]}/api/v1/route/build`,
		{
			headers: {
				'x-client-id': clientId
			},
			method: "POST",
			body: JSON.stringify({
				routeSummary: quote.data.routeSummary, 
				sender: extra.userAddress,
				recipient: extra.userAddress,
				slippageTolerance: +extra.slippage * 100,
				source: clientId
			})
		}
	).then((r) => r.json());

	let gas = tx.data.gas;

	if (chain === 'arbitrum') gas = await applyArbitrumFees(tx.data.routerAddress, tx.data.data, gas);

	return {
		amountReturned: tx.data.amountOut,
		estimatedGas: gas,
		tokenApprovalAddress: tx.data.routerAddress,
		rawQuote: tx.data,
		logo: 'https://assets.coingecko.com/coins/images/14899/small/RwdVsGcw_400x400.jpg?1618923851'
	};
}

export async function swap({ fromAddress, from, rawQuote, chain }) {
	const transactionOption: Record<string, string> = {
		from: fromAddress,
		to: rawQuote.routerAddress,
		data: rawQuote.data,
	};

	if (from === zeroAddress) transactionOption.value = rawQuote.amountIn;

	const tx = await sendTx(transactionOption);

	return tx;
}
export const getTxData = ({ rawQuote }) => rawQuote?.encodedSwapData;

export const getTx = ({ rawQuote }) => ({
	to: rawQuote.routerAddress,
	data: rawQuote.data
});
