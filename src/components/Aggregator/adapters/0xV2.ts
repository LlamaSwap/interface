import { ethers } from 'ethers';
import { defillamaReferrerAddress } from '../constants';
import { sendTx } from '../utils/sendTx';
import BigNumber from 'bignumber.js';

export const name = 'Matcha/0x V2';
export const token = 'ZRX';
export const isOutputAvailable = true;

export const chainToId = {
	ethereum: '1',
	base: '8453'
};

export const isSignatureNeededForSwap = true;

export function approvalAddress() {
	return '0x000000000022d473030f116ddee9f6b43ac78ba3';
}

const nativeToken = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
const feeCollectorAddress = '0x9Ab6164976514F1178E2BB4219DA8700c9D96E9A';

export async function getQuote(chain: string, from: string, to: string, amount: string, extra) {
	// amount should include decimals

	const tokenFrom = from === ethers.constants.AddressZero ? nativeToken : from;
	const tokenTo = to === ethers.constants.AddressZero ? nativeToken : to;
	const amountParam =
		extra.amountOut && extra.amountOut !== '0' ? `buyAmount=${extra.amountOut}` : `sellAmount=${amount}`;

	const data = await fetch(
		`https://api.0x.org/swap/permit2/quote?chainId=${
			chainToId[chain]
		}&buyToken=${tokenTo}&${amountParam}&sellToken=${tokenFrom}&slippagePercentage=${
			extra.slippage / 100
		}&affiliateAddress=${defillamaReferrerAddress}&enableSlippageProtection=false&&taker=${
			extra.userAddress
		}&feeRecipientTradeSurplus=${feeCollectorAddress}`,
		{
			headers: {
				'0x-api-key': process.env.OX_API_KEY
			}
		}
	).then((r) => {
		const data = r.json();
		if (r.status !== 200) {
			throw new Error((data as any).message ?? 'Failed to fetch');
		}
		return data;
	});

	if (
		data.allowanceTarget.toLowerCase() !== approvalAddress().toLowerCase() ||
		data.permit2.eip712.domain.verifyingContract.toLowerCase() !== approvalAddress().toLowerCase()
	) {
		throw new Error(`Router address does not match`);
	}

	const gas = chain === 'optimism' ? BigNumber(3.5).times(data.transaction.gas).toFixed(0, 1) : data.transaction.gas;

	return {
		amountReturned: data?.buyAmount || 0,
		amountIn: data?.sellAmount || 0,
		tokenApprovalAddress: data.allowanceTarget,
		estimatedGas: gas,
		rawQuote: { ...data, gasLimit: gas },
		logo: 'https://www.gitbook.com/cdn-cgi/image/width=40,height=40,fit=contain,dpr=2,format=auto/https%3A%2F%2F1690203644-files.gitbook.io%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FKX9pG8rH3DbKDOvV7di7%252Ficon%252F1nKfBhLbPxd2KuXchHET%252F0x%2520logo.png%3Falt%3Dmedia%26token%3D25a85a3e-7f72-47ea-a8b2-e28c0d24074b'
	};
}

const MAGIC_CALLDATA_STRING = 'f'.repeat(130); // used when signing the eip712 message

export async function signatureForSwap({ rawQuote, signTypedDataAsync }) {
	const signature = await signTypedDataAsync({
		domain: rawQuote.permit2.eip712.domain,
		types: rawQuote.permit2.eip712.types,
		primaryType: rawQuote.permit2.eip712.primaryType,
		value: rawQuote.permit2.eip712.message
	});

	return signature;
}

export async function swap({ signer, rawQuote, chain, signature }) {
	const fromAddress = await signer.getAddress();

	const tx = await sendTx(signer, chain, {
		from: fromAddress,
		to: rawQuote.transaction.to,
		data: rawQuote.transaction.data.replace(MAGIC_CALLDATA_STRING, signature.slice(2)),
		value: rawQuote.transaction.value,
		...(chain === 'optimism' && { gasLimit: rawQuote.gasLimit })
	});

	return tx;
}
