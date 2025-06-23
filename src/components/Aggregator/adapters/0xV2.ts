import { numberToHex, size, zeroAddress, concat} from 'viem';
import { sendTx } from '../utils/sendTx';
import { getTxs } from '../utils/getTxs';

export const name = 'Matcha/0x v2';
export const token = 'ZRX';
export const isOutputAvailable = false;

export const chainToId = {
	ethereum: '1',
	bsc: '56',
	polygon: '137',
	optimism: '10',
	arbitrum: '42161',
	avax: '43114',
	base: '8453',
	linea: '59144',
	scroll: '534352',
	blast: '81457',
	mantle: '5000',
	mode: '34443',
	unichain: '130'
};

const nativeToken = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
const feeCollectorAddress = '0x9Ab6164976514F1178E2BB4219DA8700c9D96E9A';
const permit2Address = '0x000000000022d473030f116ddee9f6b43ac78ba3';

export async function getQuote(chain: string, from: string, to: string, amount: string, extra) {
	// amount should include decimals

	const tokenFrom = from === zeroAddress ? nativeToken : from;
	const tokenTo = to === zeroAddress ? nativeToken : to;

	if (extra.amountOut && extra.amountOut !== '0') {
		throw new Error('Invalid query params');
	}

	const amountParam = `sellAmount=${amount}`;

	const taker = extra.userAddress === zeroAddress ? '0x1000000000000000000000000000000000000000' : extra.userAddress;

	// only expects integer
	const slippage = (extra.slippage * 100) | 0;

	const data = await fetch(
		`https://api.0x.org/swap/permit2/quote?chainId=${chainToId[chain]}&buyToken=${tokenTo}&${amountParam}&sellToken=${tokenFrom}&slippageBps=${slippage}&taker=${taker}&tradeSurplusRecipient=${feeCollectorAddress}`,
		{
			headers: {
				'0x-api-key': process.env.OX_API_KEY as string,
				'0x-version': 'v2'
			}
		}
	).then(async (r) => {
		if (r.status !== 200) {
			throw new Error('Failed to fetch');
		}

		const data = await r.json();

		return data;
	});

	if (
		data.permit2 !== null &&
		data.permit2.eip712.domain.verifyingContract.toLowerCase() !== permit2Address.toLowerCase()
	) {
		throw new Error(`Approval address does not match`);
	}

	return {
		amountReturned: data?.buyAmount || 0,
		amountIn: data?.sellAmount || 0,
		tokenApprovalAddress: permit2Address,
		estimatedGas: data.transaction.gas,
		rawQuote: { ...data, gasLimit: data.transaction.gas },
		isSignatureNeededForSwap: true,
		logo: 'https://www.gitbook.com/cdn-cgi/image/width=40,height=40,fit=contain,dpr=2,format=auto/https%3A%2F%2F1690203644-files.gitbook.io%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FKX9pG8rH3DbKDOvV7di7%252Ficon%252F1nKfBhLbPxd2KuXchHET%252F0x%2520logo.png%3Falt%3Dmedia%26token%3D25a85a3e-7f72-47ea-a8b2-e28c0d24074b'
	};
}

export async function signatureForSwap({ rawQuote, signTypedDataAsync }) {
	const signature = await signTypedDataAsync(rawQuote.permit2.eip712).catch((err) => {
		console.log(err)
	});
	return signature;
}

export async function swap({ tokens, fromAmount, fromAddress, rawQuote, signature, eip5792 }) {
	if (!signature) {
		throw { reason: 'Signature is required' }
	}

	const signatureLengthInHex = numberToHex(size(signature), {
		signed: false,
		size: 32
	});

	const data = signature
		? concat([rawQuote.transaction.data, signatureLengthInHex, signature])
		: rawQuote.transaction.data;

	const txs = getTxs({
		fromAddress,
		routerAddress: rawQuote.transaction.to,
		data,
		value: rawQuote.transaction.value,
		fromTokenAddress: tokens.fromToken.address,
		fromAmount,
		eip5792,
		tokenApprovalAddress: permit2Address
	});

	const tx = await sendTx(txs);

	return tx;
}

export const getTxData = ({ rawQuote }) => rawQuote?.transaction?.data;

export const getTx = ({ rawQuote }) => ({
	to: rawQuote.transaction.to,
	data: rawQuote.transaction.data,
	value: rawQuote.transaction.value
});
