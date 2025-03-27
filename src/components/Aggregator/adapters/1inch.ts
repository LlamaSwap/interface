// Source https://portal.1inch.dev/documentation/apis/swap/classic-swap/introduction

import { applyArbitrumFees } from '../utils/arbitrumFees';
import { altReferralAddress } from '../constants';
import { sendTx } from '../utils/sendTx';
import { estimateGas } from 'wagmi/actions';
import { config } from '../../WalletProvider';
import { zeroAddress } from 'viem';

export const chainToId = {
	ethereum: 1,
	bsc: 56,
	polygon: 137,
	optimism: 10,
	arbitrum: 42161,
	gnosis: 100,
	avax: 43114,
	fantom: 250,
	klaytn: 8217,
	aurora: 1313161554,
	zksync: 324,
	base: 8453
};

const spenders = {
	ethereum: '0x111111125421ca6dc452d289314280a0f8842a65',
	bsc: '0x111111125421ca6dc452d289314280a0f8842a65',
	polygon: '0x111111125421ca6dc452d289314280a0f8842a65',
	optimism: '0x111111125421ca6dc452d289314280a0f8842a65',
	arbitrum: '0x111111125421ca6dc452d289314280a0f8842a65',
	gnosis: '0x111111125421ca6dc452d289314280a0f8842a65',
	avax: '0x111111125421ca6dc452d289314280a0f8842a65',
	fantom: '0x111111125421ca6dc452d289314280a0f8842a65',
	klaytn: '0x111111125421ca6dc452d289314280a0f8842a65',
	aurora: '0x111111125421ca6dc452d289314280a0f8842a65',
	zksync: '0x6fd4383cb451173d5f9304f041c7bcbf27d561ff',
	base: '0x111111125421ca6dc452d289314280a0f8842a65'
};

export const name = '1inch';
export const token = '1INCH';
export const referral = true;

export function approvalAddress(chain: string) {
	// https://api.1inch.io/v6.0/1/approve/spender
	return spenders[chain];
}
const nativeToken = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

const apiEndpoint = 'https://api.1inch.dev/swap/v6.0/';

export async function getQuote(chain: string, from: string, to: string, amount: string, extra) {
	// ethereum = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE
	// amount should include decimals

	const tokenFrom = from === zeroAddress ? nativeToken : from;
	const tokenTo = to === zeroAddress ? nativeToken : to;
	const authHeader = process.env.INCH_API_KEY ? { 'Authorization': `Bearer ${process.env.INCH_API_KEY as string}` } : {};
	const tokenApprovalAddress = spenders[chain];

	const [data, swapData] = await Promise.all([
		fetch(
			`${apiEndpoint}${chainToId[chain]}/quote?src=${tokenFrom}&dst=${tokenTo}&amount=${amount}&includeGas=true`,
			{ headers: authHeader as any }
		).then((r) => r.json()),
		extra.userAddress !== zeroAddress
			? fetch(
				`${apiEndpoint}${chainToId[chain]}/swap?src=${tokenFrom}&dst=${tokenTo}&amount=${amount}&from=${extra.userAddress}&origin=${extra.userAddress}&slippage=${extra.slippage}&referrer=${altReferralAddress}&disableEstimate=true`,
				{ headers: authHeader as any }
			).then((r) => r.json())
			: null
	]);

	if(swapData && swapData.tx.to.toLowerCase() !== tokenApprovalAddress.toLowerCase()){
		throw new Error("approval address doesn't match")
	}

	const estimatedGas = data.gas || 0;

	let gas = estimatedGas;

	if (chain === 'arbitrum')
		gas = swapData === null ? null : await applyArbitrumFees(swapData.tx.to, swapData.tx.data, gas);

	return {
		amountReturned: swapData?.dstAmount ?? data.dstAmount,
		estimatedGas: gas,
		tokenApprovalAddress,
		rawQuote: swapData === null ? null : { ...swapData, tx: swapData.tx },
		logo: 'https://icons.llamao.fi/icons/protocols/1inch-network?w=48&q=75'
	};
}

export async function swap({ rawQuote }) {
	const txObject = {
		from: rawQuote.tx.from,
		to: rawQuote.tx.to,
		data: rawQuote.tx.data,
		value: rawQuote.tx.value
	};

	const gasPrediction = await estimateGas(config, txObject).catch(() => null);

	const tx = await sendTx({
		...txObject,
		// Increase gas +20% + 2 erc20 txs
		...(gasPrediction ? { gas: (gasPrediction * 12n) / 10n + 86000n } : {})
	});
	return tx;
}

export const getTxData = ({ rawQuote }) => rawQuote?.tx?.data;

export const getTx = ({ rawQuote }) => {
	if (rawQuote === null) {
		return {};
	}
	return {
		from: rawQuote.tx.from,
		to: rawQuote.tx.to,
		data: rawQuote.tx.data,
		value: rawQuote.tx.value
	};
};
