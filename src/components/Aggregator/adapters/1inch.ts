// Source https://docs.1inch.io/docs/aggregation-protocol/api/swagger

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
	ethereum: '0x1111111254eeb25477b68fb85ed929f73a960582',
	bsc: '0x1111111254eeb25477b68fb85ed929f73a960582',
	polygon: '0x1111111254eeb25477b68fb85ed929f73a960582',
	optimism: '0x1111111254eeb25477b68fb85ed929f73a960582',
	arbitrum: '0x1111111254eeb25477b68fb85ed929f73a960582',
	gnosis: '0x1111111254eeb25477b68fb85ed929f73a960582',
	avax: '0x1111111254eeb25477b68fb85ed929f73a960582',
	fantom: '0x1111111254eeb25477b68fb85ed929f73a960582',
	klaytn: '0x1111111254eeb25477b68fb85ed929f73a960582',
	aurora: '0x1111111254eeb25477b68fb85ed929f73a960582',
	zksync: '0x6e2b76966cbd9cf4cc2fa0d76d24d5241e0abc2f',
	base: '0x1111111254eeb25477b68fb85ed929f73a960582'
};

export const name = '1inch';
export const token = '1INCH';
export const referral = true;

export function approvalAddress(chain: string) {
	// https://api.1inch.io/v4.0/1/approve/spender
	return spenders[chain];
}
const nativeToken = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

export async function getQuote(chain: string, from: string, to: string, amount: string, extra) {
	// ethereum = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE
	// amount should include decimals

	const tokenFrom = from === zeroAddress ? nativeToken : from;
	const tokenTo = to === zeroAddress ? nativeToken : to;
	const authHeader = process.env.INCH_API_KEY ? { 'auth-key': process.env.INCH_API_KEY as string } : {};
	const tokenApprovalAddress = spenders[chain];

	const [data, swapData] = await Promise.all([
		fetch(
			`https://api-defillama.1inch.io/v5.2/${chainToId[chain]}/quote?src=${tokenFrom}&dst=${tokenTo}&amount=${amount}&includeGas=true`,
			{ headers: authHeader as any }
		).then((r) => r.json()),
		extra.userAddress !== zeroAddress
			? fetch(
					`https://api-defillama.1inch.io/v5.2/${chainToId[chain]}/swap?src=${tokenFrom}&dst=${tokenTo}&amount=${amount}&from=${extra.userAddress}&slippage=${extra.slippage}&referrer=${altReferralAddress}&disableEstimate=true`,
					{ headers: authHeader as any }
				).then((r) => r.json())
			: null
	]);

	const estimatedGas = data.gas || 0;

	let gas = estimatedGas;

	if (chain === 'arbitrum')
		gas = swapData === null ? null : await applyArbitrumFees(swapData.tx.to, swapData.tx.data, gas);

	return {
		amountReturned: swapData?.toAmount ?? data.toAmount,
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
