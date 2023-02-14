import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { sendTx } from '../utils/sendTx';
import { providers } from '../rpcs';

export const chainToId = {
	ethereum: 1,
	bsc: 56,
	heco: 128,
	polygon: 137,
	arbitrum: 42161,
	moonriver: 1285,
	okexchain: 66,
	boba: 288,
	optimism: 10,
	aurora: 1313161554,
	avax: 43114
};

const approvalContract = {
	ethereum: '0xCB859eA579b28e02B87A1FDE08d087ab9dbE5149',
	bsc: '0xa128Ba44B2738A558A1fdC06d6303d52D3Cef8c1',
	heco: '0x68b6c06Ac8Aa359868393724d25D871921E97293',
	polygon: '0x6D310348d5c12009854DFCf72e0DF9027e8cb4f4',
	arbitrum: '0xA867241cDC8d3b0C07C85cC06F25a0cD3b5474d8',
	moonriver: '0xE8C9A78725D0451FA19878D5f8A3dC0D55FECF25',
	okexchain: '0x7737fd30535c69545deeEa54AB8Dd590ccaEBD3c',
	boba: '0x8F8Dd7DB1bDA5eD3da8C9daf3bfa471c12d58486',
	optimism: '0xa492d6eABcdc3E204676f15B950bBdD448080364',
	aurora: '0x335aC99bb3E51BDbF22025f092Ebc1Cf2c5cC619',
	avax: '0xCFea63e3DE31De53D68780Dd65675F169439e470'
};

export const name = 'DODO';
export const token = 'DODO';

// https://docs.dodoex.io/english/developers/contracts-address
export function approvalAddress(chain: string) {
	return approvalContract[chain];
}
const nativeToken = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

export async function getQuote(
	chain: string,
	from: string,
	to: string,
	// amount should include decimals
	amount: string,
	{ userAddress, fromToken, toToken, slippage }
) {
	const isFromNative = from === ethers.constants.AddressZero;
	const fromTokenAddress = isFromNative ? nativeToken : from;
	const toTokenAddress = to === ethers.constants.AddressZero ? nativeToken : to;
	// 20 min
	const deadLine = Math.floor(new Date().getTime() / 1000 + 1200);

	const api = 'https://api.dodoex.io/route_api/llama_swap/getdodoroute';
	const search = new URLSearchParams();
	search.set('fromTokenAddress', fromTokenAddress);
	search.set('fromTokenDecimals', fromToken?.decimals);
	search.set('toTokenAddress', toTokenAddress);
	search.set('toTokenDecimals', toToken?.decimals);
	search.set('fromAmount', amount);
	search.set('userAddr', userAddress);
	search.set('estimateGas', String(userAddress && userAddress !== ethers.constants.AddressZero));
	search.set('slippage', slippage);
	search.set('chainId', chainToId[chain]);
	search.set('deadLine', String(deadLine));
	search.set('source', 'dodoSwap');
	const url = `${api}?${search.toString()}`;

	const swapData = await fetch(url, {
		headers: {
			apikey: 'agf67rm26zdq5gwn'
		}
	})
		.then((r) => r.json())
		.then((r) => r.data);

	const value = swapData.value || isFromNative ? amount : undefined;
	let gasLimit;
	try {
		gasLimit = (
			await providers[chain].estimateGas({
				from: userAddress,
				to: swapData.to,
				data: swapData.data,
				value
			})
		).toString();
	} catch (e) {}

	return {
		amountReturned: swapData.resAmount
			? new BigNumber(swapData.resAmount).times(10 ** Number(swapData.targetDecimals || 18))
			: undefined,
		estimatedGas: gasLimit,
		tokenApprovalAddress: swapData.targetApproveAddr || approvalContract[chain],
		rawQuote: swapData === null ? null : { ...swapData, from: userAddress, value },
		logo: 'https://app.dodoex.io/DODO.svg'
	};
}

export async function swap({ signer, rawQuote, chain }) {
	const tx = await sendTx(signer, chain, {
		from: rawQuote.from,
		to: rawQuote.to,
		data: rawQuote.data,
		value: rawQuote.value
	});
	return tx;
}

export const getTxData = ({ rawQuote }) => rawQuote?.data;

export const getTx = ({ rawQuote }) => {
	if (rawQuote === null) {
		return {};
	}
	return {
		from: rawQuote.from,
		to: rawQuote.to,
		data: rawQuote.data,
		value: rawQuote.value
	};
};
