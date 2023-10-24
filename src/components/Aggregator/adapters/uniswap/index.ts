import { AllowanceData, AllowanceProvider, AllowanceTransfer, PERMIT2_ADDRESS } from '@uniswap/permit2-sdk';
import { ethers } from 'ethers';
import { sendTx } from '../../utils/sendTx';
import { rpcUrls } from '../../rpcs';
import { redirectQuoteReq } from '../utils';

export const chainToId = {
	ethereum: 1,
	arbitrum: 42161,
	optimism: 10
};

const providers = {
	ethereum: new ethers.providers.JsonRpcProvider(rpcUrls[1].default, {
		name: 'ethereum',
		chainId: 1
	}),
	arbitrum: new ethers.providers.JsonRpcProvider(rpcUrls[42161].default, {
		name: 'arbitrum',
		chainId: 42161
	}),
	optimism: new ethers.providers.JsonRpcProvider(rpcUrls[10].default, {
		name: 'optimism',
		chainId: 10
	})
};

export const name = 'Uniswap';
export const token = 'UNI';

const fetchQuote = async ({ chain, from, to, amount, userAddress, signature = null, permit = null }) => {
	console.log(
		signature
			? {
					permitSignature: signature,
					permitAmount: permit.details.amount,
					permitExpiration: permit.details.expiration,
					permitSigDeadline: permit.sigDeadline,
					permitNonce: permit.details.nonce
			  }
			: {}
	);
	const quote = await fetch('https://api.uniswap.org/v2/quote', {
		headers: {
			origin: 'https://app.uniswap.org/'
		},
		referrer: 'https://app.uniswap.org/',
		referrerPolicy: 'strict-origin-when-cross-origin',
		body: JSON.stringify({
			tokenInChainId: chainToId[chain],
			tokenIn: from,
			tokenOutChainId: chainToId[chain],
			tokenOut: to,
			amount,
			sendPortionEnabled: false,
			type: 'EXACT_INPUT',
			configs: [
				{
					protocols: ['V2', 'V3', 'MIXED'],
					enableUniversalRouter: true,
					routingType: 'CLASSIC',
					recipient: userAddress,
					...(signature
						? {
								permitSignature: signature,
								permitAmount: permit.details.amount,
								permitExpiration: permit.details.expiration,
								permitSigDeadline: permit.sigDeadline,
								permitNonce: permit.details.nonce
						  }
						: {})
				}
			]
		}),
		method: 'POST',
		mode: 'cors',
		credentials: 'omit'
	}).then((r) => r.json());

	return quote;
};

export async function getQuote(chain: string, from: string, to: string, amount: string, extra) {
	const { quote } = await fetchQuote({
		chain,
		from,
		to,
		userAddress: extra.userAddress,
		amount,
		permit: extra?.permit,
		signature: extra?.signature
	});
	const routerAddress = quote?.methodParameters?.to;

	return {
		amountReturned: quote?.quote,
		estimatedGas: quote?.quoteGasAdjustedDecimals,
		tokenApprovalAddress: PERMIT2_ADDRESS,
		rawQuote: {
			tx: {
				data: quote?.methodParameters?.calldata,
				value: quote?.methodParameters?.value,
				to: routerAddress
			},
			gasLimit: quote?.gasUseEstimateQuote
		}
	};
}

export async function swap({ chain, signer, rawQuote, ...params }) {
	const fromAddress = await signer.getAddress();
	const routerAddress = rawQuote?.tx?.to;
	const { from, to } = params;
	const amount = params?.route?.fromAmount;

	const signPermitAndSwap = async (provider: ethers.Wallet) => {
		const allowanceProvider = new AllowanceProvider(providers[chain], PERMIT2_ADDRESS);
		const allowance: AllowanceData = await allowanceProvider?.getAllowanceData(from, fromAddress, routerAddress);
		const deadline = (new Date().getTime() / 1000 + 300).toFixed(0);
		const permitDetails = {
			nonce: allowance.nonce,
			token: from,
			amount,
			expiration: deadline
		};
		const { domain, types, values } = AllowanceTransfer.getPermitData(
			{
				spender: routerAddress,
				sigDeadline: deadline,
				details: permitDetails
			},
			PERMIT2_ADDRESS,
			chainToId[chain]
		);
		const signature = await provider._signTypedData(domain, types, values);
		const permit = {
			signature,
			details: permitDetails,
			sigDeadline: deadline,
			spender: routerAddress
		};

		const quote = await redirectQuoteReq('Uniswap', chain, from, to, amount, { signature, permit });

		const res = await sendTx(signer, chain, {
			from: fromAddress,
			...quote?.rawQuote?.tx,
			...(chain === 'optimism' && { gasLimit: rawQuote.gasLimit })
		});

		return res;
	};

	return from === ethers.constants.AddressZero
		? await sendTx(signer, chain, {
				from: fromAddress,
				...rawQuote?.tx,
				...(chain === 'optimism' && { gasLimit: rawQuote.gasLimit })
		  })
		: await signPermitAndSwap(signer);
}

export const getTxData = ({ rawQuote }) => rawQuote?.tx?.data;

export const getTx = ({ rawQuote }) => ({
	to: rawQuote?.tx?.to,
	data: rawQuote?.tx?.data,
	value: rawQuote?.tx?.value
});
