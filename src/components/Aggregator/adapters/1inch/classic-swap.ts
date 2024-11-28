import { AUTH_HEADER, CHAIN_TO_ID, SPENDERS } from '~/components/Aggregator/adapters/1inch/constants';
import { altReferralAddress } from '~/components/Aggregator/constants';
import { applyArbitrumFees } from '~/components/Aggregator/utils/arbitrumFees';
import { sendTx } from '~/components/Aggregator/utils/sendTx';
import { zeroAddress } from 'viem';
import { estimateGas } from 'wagmi/actions';
import { config } from '../../../WalletProvider';

const CLASSIC_ENDPOINT = 'http://localhost:8888/swap/v6.0/';

export async function getClassicQuote(chain: string, tokenFrom: string, tokenTo: string, amount: string, extra) {
	return await Promise.all([
		fetch(
			`${CLASSIC_ENDPOINT}${CHAIN_TO_ID[chain]}/quote?src=${tokenFrom}&dst=${tokenTo}&amount=${amount}&includeGas=true`,
			{ headers: AUTH_HEADER as any }
		).then((r) => r.json()),
		extra.userAddress !== zeroAddress
			? fetch(
				`${CLASSIC_ENDPOINT}${CHAIN_TO_ID[chain]}/swap?src=${tokenFrom}&dst=${tokenTo}&amount=${amount}&from=${extra.userAddress}&slippage=${extra.slippage}&referrer=${altReferralAddress}&disableEstimate=true`,
				{ headers: AUTH_HEADER as any }
			).then((r) => r.json())
			: null
	]);
}

export async function parseClassicQuote(chain: string, quote) {
	const [data, swapData] = quote;
	const tokenApprovalAddress = SPENDERS[chain];
	let gas = data.gas || 0;

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

export async function classicSwap(rawQuote) {
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