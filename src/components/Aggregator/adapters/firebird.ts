import BigNumber from 'bignumber.js';
import { chainsMap, defillamaReferrerAddress } from '../constants';
import { ExtraData } from '../types';
import { applyArbitrumFees } from '../utils/arbitrumFees';
import { sendTx } from '../utils/sendTx';
import { zeroAddress } from 'viem';
import { estimateGas } from 'wagmi/actions';
import { config } from '../../WalletProvider';

export const chainToId = {
	ethereum: chainsMap.ethereum,
	bsc: chainsMap.bsc,
	polygon: chainsMap.polygon,
	optimism: chainsMap.optimism,
	arbitrum: chainsMap.arbitrum,
	avax: chainsMap.avax,
	fantom: chainsMap.fantom,
	cronos: chainsMap.cronos,
	canto: chainsMap.canto,
	base: chainsMap.base,
	zksync: chainsMap.zksync
	//opBNB
	//pulse
};

const approvalAddresses = {
	ethereum: '0xe0C38b2a8D09aAD53f1C67734B9A95E43d5981c0',
	bsc: '0x92e4F29Be975C1B1eB72E77De24Dccf11432a5bd',
	polygon: '0xb31D1B1eA48cE4Bf10ed697d44B747287E785Ad4',
	optimism: '0x0c6134Abc08A1EafC3E2Dc9A5AD023Bb08Da86C3',
	arbitrum: '0x0c6134Abc08A1EafC3E2Dc9A5AD023Bb08Da86C3',
	avax: '0xe0C38b2a8D09aAD53f1C67734B9A95E43d5981c0',
	fantom: '0xe0C38b2a8D09aAD53f1C67734B9A95E43d5981c0',
	cronos: '0x4A5a7331dA84d3834C030a9b8d4f3d687A3b788b',
	canto: '0x984742Be1901fcbed70d7B5847bee5BE006d91C8',
	base: '0x20f0b18BDDe8e3dd0e42C173062eBdd05C421151',
	zksync: '0xc593dcfD1E4605a6Cd466f5C6807D444414dBc97'
};

export const name = 'Firebird';
export const token = 'HOPE';

export function approvalAddress(chain: string) {
	return approvalAddresses[chain];
}

const routerAPI = 'https://router.firebird.finance/aggregator/v2';
const headers = {
	'content-type': 'application/json',
	'api-key': 'firebird_defillama'
};
const nativeToken = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

export async function getQuote(chain: string, from: string, to: string, amount: string, extra: ExtraData) {
	const isFromNative = from === zeroAddress;
	const tokenFrom = isFromNative ? nativeToken : from;
	const tokenTo = to === zeroAddress ? nativeToken : to;
	const receiver = extra.userAddress || defillamaReferrerAddress;

	// amount should include decimals
	const result = await fetch(
		`${routerAPI}/quote?chainId=${
			chainToId[chain]
		}&from=${tokenFrom}&to=${tokenTo}&amount=${amount}&receiver=${receiver}&slippage=${
			+extra.slippage / 100
		}&source=defillama&ref=${defillamaReferrerAddress}`,
		{ headers }
	).then((r) => r.json());
	const data = result.quoteData;

	const { encodedData } = await fetch(`${routerAPI}/encode`, {
		method: 'POST',
		headers,
		body: JSON.stringify(result)
	}).then((r) => r.json());

	let estimatedGas;
	let value = isFromNative ? BigInt(amount) : undefined;
	try {
		estimatedGas = (
			await estimateGas(config, {
				to: encodedData.router,
				data: encodedData.data,
				value,
				chainId: chainsMap[chain]
			})
		).toString();
	} catch (e) {
		estimatedGas = data.maxReturn.totalGas;
	}

	if (estimatedGas) {
		if (chain === 'optimism') estimatedGas = BigNumber(3.5).times(estimatedGas).toFixed(0, 1);
		if (chain === 'arbitrum')
			estimatedGas = await applyArbitrumFees(encodedData.router, encodedData.data, estimatedGas);
	}

	return {
		amountReturned: data.maxReturn.totalTo,
		estimatedGas,
		tokenApprovalAddress: encodedData.router,
		rawQuote: { ...data, tx: { ...encodedData, from: receiver, value, gasLimit: estimatedGas } },
		logo: 'https://assets.coingecko.com/markets/images/730/small/firebird-finance.png?1636117048'
	};
}

export async function swap({ rawQuote, chain }) {
	const tx = await sendTx({
		from: rawQuote.tx.from,
		to: rawQuote.tx.router,
		data: rawQuote.tx.data,
		value: rawQuote.tx.value,
		...(chain === 'optimism' && { gas: rawQuote.gasLimit })
	});

	return tx;
}

export const getTxData = ({ rawQuote }) => rawQuote?.tx?.data;

export const getTx = ({ rawQuote }) => ({ ...rawQuote?.tx, to: rawQuote?.tx?.router });
