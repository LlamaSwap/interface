import { AVAILABLE_CHAINS_FOR_FUSION, CHAIN_TO_ID, SPENDERS } from './constants';
import { FusionSDK, OrderStatus } from '@1inch/fusion-sdk';
import { formatUnits, parseUnits } from 'ethers/lib/utils';

// const FUSION_QUOTE_ENDPOINT = 'https://api-defillama.1inch.io/v2.0/fusion';
const FUSION_SDK_ENDPOINT = 'http://localhost:8888/fusion';
const SOURCE = 'f012a792';

export function isFusionSupported(chainId: number): boolean {
	return AVAILABLE_CHAINS_FOR_FUSION.has(chainId);
}

export async function getFusionQuoteResponse(params: {
	chain: string,
	tokenFrom: string,
	tokenTo: string,
	amount: string,
	address: string,
}) {
	const { chain, tokenFrom, tokenTo, amount, address } = params;
	const sdk = new FusionSDK({
		url: FUSION_SDK_ENDPOINT,
		network: CHAIN_TO_ID[chain]
	});

	return await sdk.getQuote({
		fromTokenAddress: tokenFrom,
		toTokenAddress: tokenTo,
		amount,
		walletAddress: address,
		source: SOURCE,
	});
}

export async function fusionSwap(chain, quote, signer, signTypedDataAsync) {
	const sdk = new FusionSDK({
		url: FUSION_SDK_ENDPOINT,
		network: CHAIN_TO_ID[chain],
		blockchainProvider: {
			signTypedData: (_, typedData) => signTypedDataAsync({
				domain: typedData.domain,
				types: typedData.types,
				primaryType: typedData.primaryType,
				value: typedData.message
			}),
			ethCall: signer.call.bind(signer)
		}
	});

	return await sdk.placeOrder({
		fromTokenAddress: quote.params.fromTokenAddress.val,
		toTokenAddress: quote.params.toTokenAddress.val,
		walletAddress: quote.params.walletAddress.val,
		amount: quote.params.amount,
		source: SOURCE,
	});
}

export const getOrderStatus = (chain, hash) => async () => {
	const sdk = new FusionSDK({
		url: FUSION_SDK_ENDPOINT,
		network: CHAIN_TO_ID[chain]
	});
	let status;

	while (true) {
		try {
			const data = await sdk.getOrderStatus(hash);

			if (data.status === OrderStatus.Filled) {
				status = 1;
				break
			}
		} catch (e) {
			console.log(e)
		}
	}

	return {
		status
	};
};

export function parseFusionQuote(chain: string, quote, extra) {
	const { presets, recommendedPreset, toTokenAmount } = quote;
	const { auctionStartAmount, auctionEndAmount } = presets[recommendedPreset];
	const dstTokenDecimals = extra.toToken.decimals;

	const start = formatUnits(auctionStartAmount, dstTokenDecimals);
	const end = formatUnits(auctionEndAmount, dstTokenDecimals);
	const amount = formatUnits(toTokenAmount, dstTokenDecimals);

	const receivedAmount = amount < start ? amount : start;
	const amountReturned = end > receivedAmount ? end : receivedAmount;

	return {
		amountReturned: parseUnits(amountReturned, dstTokenDecimals).toString(),
		estimatedGas: 0,
		tokenApprovalAddress: SPENDERS[chain],
		rawQuote: quote,
		logo: 'https://icons.llamao.fi/icons/protocols/1inch-network?w=48&q=75'
	};
}