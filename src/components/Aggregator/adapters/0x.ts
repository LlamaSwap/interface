import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { defillamaReferrerAddress } from '../constants';
import { sendTx } from '../utils/sendTx';

export const chainToId = {
	ethereum: 'https://api.0x.org/',
	bsc: 'https://bsc.api.0x.org/',
	polygon: 'https://polygon.api.0x.org/',
	optimism: 'https://optimism.api.0x.org/',
	arbitrum: 'https://arbitrum.api.0x.org/',
	avax: 'https://avalanche.api.0x.org/',
	fantom: 'https://fantom.api.0x.org/',
	celo: 'https://celo.api.0x.org/'
};

export const name = 'Matcha/0x';
export const token = 'ZRX';

export function approvalAddress() {
	// https://docs.0x.org/0x-api-swap/guides/swap-tokens-with-0x-api
	return '0xdef1c0ded9bec7f1a1670819833240f027b25eff';
}

const nativeToken = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

export async function getQuote(chain: string, from: string, to: string, amount: string, extra) {
	// amount should include decimals

	const tokenFrom = from === ethers.constants.AddressZero ? nativeToken : from;
	const tokenTo = to === ethers.constants.AddressZero ? nativeToken : to;
	const data = await fetch(
		`${
			chainToId[chain]
		}swap/v1/quote?buyToken=${tokenTo}&sellToken=${tokenFrom}&sellAmount=${amount}&slippagePercentage=${
			extra.slippage / 100 || 1
		}&affiliateAddress=${defillamaReferrerAddress}&enableSlippageProtection=false&intentOnFilling=true&takerAddress=${
			extra.userAddress
		}&skipValidation=true`,
		{
			headers: {
				'0x-api-key': process.env.OX_API_KEY
			}
		}
	).then((r) => r.json());

	const gas = chain === 'optimism' ? BigNumber(3.5).times(data.gas).toFixed(0, 1) : data.gas;

	return {
		amountReturned: data?.buyAmount || 0,
		estimatedGas: gas,
		tokenApprovalAddress: data.to,
		rawQuote: { ...data, gasLimit: gas },
		logo: 'https://www.gitbook.com/cdn-cgi/image/width=40,height=40,fit=contain,dpr=2,format=auto/https%3A%2F%2F1690203644-files.gitbook.io%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FKX9pG8rH3DbKDOvV7di7%252Ficon%252F1nKfBhLbPxd2KuXchHET%252F0x%2520logo.png%3Falt%3Dmedia%26token%3D25a85a3e-7f72-47ea-a8b2-e28c0d24074b'
	};
}

export async function swap({ signer, rawQuote, chain }) {
	const fromAddress = await signer.getAddress();

	const tx = await sendTx(signer, chain, {
		from: fromAddress,
		to: rawQuote.to,
		data: rawQuote.data,
		value: rawQuote.value,
		...(chain === 'optimism' && { gasLimit: rawQuote.gasLimit })
	});

	return tx;
}

export const getTxData = ({ rawQuote }) => rawQuote?.data;

export const getTx = ({ rawQuote }) => ({
	to: rawQuote.to,
	data: rawQuote.data,
	value: rawQuote.value
});
