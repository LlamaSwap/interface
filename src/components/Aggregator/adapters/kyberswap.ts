import { applyArbitrumFees } from '../utils/arbitrumFees';
import { ExtraData } from '../types';
import { sendTx } from '../utils/sendTx';
import { zeroAddress } from 'viem';

// https://docs.kyberswap.com/kyberswap-solutions/kyberswap-aggregator/aggregator-api-specification/evm-swaps
export const chainToId = {
	ethereum: 'ethereum',
	bsc: 'bsc',
	polygon: 'polygon',
	optimism: 'optimism',
	arbitrum: 'arbitrum',
	avax: 'avalanche',
	fantom: 'fantom',
	zksync: 'zksync',
	polygonzkevm: 'polygon-zkevm',
	linea: 'linea',
	base: 'base',
	scroll: 'scroll',
	sonic: 'sonic',
	//mantle
	//blast

	// removed
	// cronos: 'cronos',
	// aurora: 'aurora',
	// bttc: 'bttc',
};

const universalRouter = "0x6131b5fae19ea4f9d964eac0408e4408b66337b5"

const routers = {
	ethereum: universalRouter,
	bsc: universalRouter,
	polygon: universalRouter,
	optimism: universalRouter,
	arbitrum: universalRouter,
	avax: universalRouter,
	fantom: universalRouter,
	zksync: '0x3F95eF3f2eAca871858dbE20A93c01daF6C2e923',
	polygonzkevm: universalRouter,
	linea: universalRouter,
	base: universalRouter,
	scroll: universalRouter,
	sonic: universalRouter,
}

export const name = 'KyberSwap';
export const token = 'KNC';

export function approvalAddress() {
	return universalRouter;
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

	const tx = extra.userAddress === zeroAddress? null : await fetch(
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

	let gas = tx === null? quote.data.routeSummary.gas : tx.data.gas;

	if(tx !== null){
		if (chain === 'arbitrum') gas = await applyArbitrumFees(tx.data.routerAddress, tx.data.data, gas);

		if(routers[chain].toLowerCase() !== tx.data.routerAddress.toLowerCase()){
			throw new Error("Approval address doesn't match hardcoded one")
		}
	}

	return {
		amountReturned: tx === null? quote.data.routeSummary.amountOut: tx.data.amountOut,
		estimatedGas: gas,
		tokenApprovalAddress: routers[chain],
		rawQuote: tx === null? {} : tx.data,
		logo: 'https://assets.coingecko.com/coins/images/14899/small/RwdVsGcw_400x400.jpg?1618923851'
	};
}

export async function swap({ fromAddress, from, rawQuote }) {
	const transactionOption: Record<string, string> = {
		from: fromAddress,
		to: rawQuote.routerAddress,
		data: rawQuote.data,
	};

	if (from === zeroAddress) transactionOption.value = rawQuote.amountIn;

	const tx = await sendTx(transactionOption);

	return tx;
}
export const getTxData = ({ rawQuote }) => rawQuote?.data;

export const getTx = ({ rawQuote }) => ({
	to: rawQuote.routerAddress,
	data: rawQuote.data
});
