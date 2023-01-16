import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { defillamaReferrerAddress } from '../constants';
import { ExtraData } from '../types';
import { providers } from '../rpcs';
import { applyArbitrumFees } from '../utils/arbitrumFees';
import { sendTx } from '../utils/sendTx';

export const chainToId = {
	ethereum: 1,
	bsc: 56,
	polygon: 137,
	optimism: 10,
	arbitrum: 42161,
	avax: 43114,
	fantom: 250,
	cronos: 25
};

const approvalAddresses = {
	ethereum: '0xe0C38b2a8D09aAD53f1C67734B9A95E43d5981c0',
	bsc: '0x92e4F29Be975C1B1eB72E77De24Dccf11432a5bd',
	polygon: '0xb31D1B1eA48cE4Bf10ed697d44B747287E785Ad4',
	optimism: '0x0c6134Abc08A1EafC3E2Dc9A5AD023Bb08Da86C3',
	arbitrum: '0x0c6134Abc08A1EafC3E2Dc9A5AD023Bb08Da86C3',
	avax: '0xe0C38b2a8D09aAD53f1C67734B9A95E43d5981c0',
	fantom: '0xe0C38b2a8D09aAD53f1C67734B9A95E43d5981c0',
	cronos: '0x4A5a7331dA84d3834C030a9b8d4f3d687A3b788b'
};

export const name = 'Firebird';
export const token = 'HOPE';

export function approvalAddress(chain: string) {
	return approvalAddresses[chain];
}

const routerAPI = 'https://router.firebird.finance/aggregator/v2';
const headers = {
	'content-type': 'application/json',
	'api-key': 'firebird_defillama',
};
const nativeToken = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

export async function getQuote(chain: string, from: string, to: string, amount: string, extra: ExtraData) {
	const isFromNative = from === ethers.constants.AddressZero;
	const tokenFrom = isFromNative ? nativeToken : from;
	const tokenTo = to === ethers.constants.AddressZero ? nativeToken : to;
	const receiver = extra.userAddress || ethers.constants.AddressZero;

	// amount should include decimals
	const result = await fetch(
		`${routerAPI}/quote?chainId=${chainToId[chain]}&from=${tokenFrom}&to=${tokenTo}&amount=${amount}&receiver=${receiver}&slippage=${extra.slippage}&source=defillama&ref=${defillamaReferrerAddress}`,
		{ headers }
	).then((r) => r.json());
	const data = result.quoteData;

	const { encodedData } = await fetch(
		`${routerAPI}/encode`,
		{
			method: 'POST',
			headers,
			body: JSON.stringify(result)
		}
	).then((r) => r.json());

	let estimatedGas;
	let value = isFromNative ? amount : undefined;
	try {
		estimatedGas = (await providers[chain].estimateGas({
			to: encodedData.router,
			data: encodedData.data,
			value,
		})).toFixed(0, 1);
	} catch (e) {
		estimatedGas = data.maxReturn.totalGas
	}

	if (estimatedGas) {
		if (chain === 'optimism') estimatedGas = BigNumber(3.5).times(estimatedGas).toFixed(0, 1);
		if (chain === 'arbitrum') estimatedGas = await applyArbitrumFees(encodedData.router, encodedData.data, estimatedGas);
	}

	return {
		amountReturned: data.maxReturn.totalTo,
		estimatedGas,
		tokenApprovalAddress: encodedData.router,
		rawQuote: { ...data, tx: { ...encodedData, from: receiver, value, gasLimit: estimatedGas } },
		logo: 'https://assets.coingecko.com/markets/images/730/small/firebird-finance.png?1636117048'
	};
}

export async function swap({ signer, rawQuote, chain }) {
	const tx = await sendTx(signer, chain, {
		from: rawQuote.tx.from,
		to: rawQuote.tx.router,
		data: rawQuote.tx.data,
		value: rawQuote.tx.value,
		...(chain === 'optimism' && { gasLimit: rawQuote.gasLimit })
	});

	return tx;
}

export const getTxData = ({ rawQuote }) => rawQuote?.tx?.data;
