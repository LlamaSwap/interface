import BigNumber from 'bignumber.js';
import { applyArbitrumFees } from '../../utils/arbitrumFees';
import { sendTx } from '../../utils/sendTx';
import { ABI } from './abi';
import { encodeFunctionData, zeroAddress } from 'viem';

export const chainToId = {
	ethereum: 1
	/*
	bsc: 56,
	polygon: 137,
	arbitrum: 42161,
	avax: 43114,
	optimism: 10
	*/
};

export const name = 'Hashflow';
export const token = 'HFT';
export const isOutputAvailable = true;

// from https://docs.hashflow.com/hashflow/taker/getting-started#5.-execute-quote-on-chain
const routerAddress = {
	1: '0xF6a94dfD0E6ea9ddFdFfE4762Ad4236576136613',
	10: '0xb3999F658C0391d94A37f7FF328F3feC942BcADC',
	56: '0x0ACFFB0fb2cddd9BD35d03d359F3D899E32FACc9',
	137: '0x72550597dc0b2e0beC24e116ADd353599Eff2E35',
	42161: '0x1F772fA3Bc263160ea09bB16CE1A6B8Fc0Fab36a',
	43114: '0x64D2f9F44FE26C157d552aE7EAa613Ca6587B59e'
};

export async function getQuote(chain: string, from: string, to: string, amount: string, extra) {
	const amountParam =
		extra.amountOut && extra.amountOut !== '0' ? { quoteTokenAmount: extra.amountOut } : { baseTokenAmount: amount };

	const data = await fetch(`https://api.hashflow.com/taker/v2/rfq`, {
		method: 'POST',
		body: JSON.stringify({
			networkId: chainToId[chain],
			source: 'defillama',
			rfqType: 0,
			baseToken: from,
			quoteToken: to,
			trader: extra.userAddress,
			...amountParam
		}),
		headers: {
			'Content-Type': 'application/json',
			Authorization: process.env.HASHFLOW_API_KEY as string
		}
	}).then((r) => r.json());
	const gas = chain === 'optimism' ? BigNumber(3.5).times(data.gasEstimate).toFixed(0, 1) : data.gasEstimate;

	// https://docs.hashflow.com/hashflow/taker/getting-started#5.-execute-quote-on-chain
	const encodedData = encodeFunctionData({
		abi: ABI,
		args: [
			{
				pool: data.quoteData.pool as `0x${string}`,
				externalAccount: data.quoteData.eoa ?? (zeroAddress as `0x${string}`),
				trader: data.quoteData.trader as `0x${string}`,
				effectiveTrader: data.quoteData.effectiveTrader ?? (data.quoteData.trader as `0x${string}`),
				baseToken: data.quoteData.baseToken as `0x${string}`,
				quoteToken: data.quoteData.quoteToken as `0x${string}`,
				effectiveBaseTokenAmount: data.quoteData.baseTokenAmount as any,
				maxBaseTokenAmount: data.quoteData.baseTokenAmount as any,
				maxQuoteTokenAmount: data.quoteData.quoteTokenAmount as any,
				quoteExpiry: data.quoteData.quoteExpiry as any,
				nonce: data.quoteData.nonce as any,
				txid: data.quoteData.txid as `0x${string}`,
				signature: data.signature as `0x${string}`
			}
		]
	});

	const txData = {
		to: routerAddress[chainToId[chain]],
		data: encodedData
	};

	let estimatedGas = gas;
	if (chain === 'arbitrum') estimatedGas = await applyArbitrumFees(txData.to, txData.data, gas);

	const timeTillExpiry = data.quoteData.quoteExpiry - Date.now() / 1000;
	if (timeTillExpiry < 40) {
		throw new Error('Expiry is too close');
	}

	return {
		amountReturned: data?.quoteData?.quoteTokenAmount || 0,
		amountIn: data?.quoteData?.baseTokenAmount || 0,
		estimatedGas,
		tokenApprovalAddress: routerAddress[chainToId[chain]],
		validTo: data.quoteData.quoteExpiry,
		rawQuote: {
			...data,
			gasLimit: estimatedGas,
			tx: { ...txData, ...(from === zeroAddress ? { value: data.quoteData.baseTokenAmount } : {}) }
		},
		isMEVSafe: true
	};
}

export async function swap({ rawQuote, chain }) {
	const tx = await sendTx([{
		...rawQuote.tx,
		...(chain === 'optimism' && { gas: rawQuote.tx.gasLimit })
	}]);

	return tx;
}

export const getTxData = ({ rawQuote }) => rawQuote?.tx?.data;

export const getTx = ({ rawQuote }) => rawQuote.tx;
