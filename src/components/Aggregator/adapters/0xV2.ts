import { BigNumber, ethers } from 'ethers';
import { sendTx } from '../utils/sendTx';
import { getAllowance, oldErc } from '../utils/getAllowance';

export const name = '0x/Matcha';
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
	blast: '43114'
};

const nativeToken = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
const feeCollectorAddress = '0x9Ab6164976514F1178E2BB4219DA8700c9D96E9A';
const permit2Address = '0x000000000022d473030f116ddee9f6b43ac78ba3';

export async function getQuote(chain: string, from: string, to: string, amount: string, extra) {
	// amount should include decimals

	const tokenFrom = from === ethers.constants.AddressZero ? nativeToken : from;
	const tokenTo = to === ethers.constants.AddressZero ? nativeToken : to;

	if (extra.amountOut && extra.amountOut !== '0') {
		throw new Error('Invalid query params');
	}

	const amountParam = `sellAmount=${amount}`;

	const taker =
		extra.userAddress === '0x0000000000000000000000000000000000000000'
			? '0x1000000000000000000000000000000000000000'
			: extra.userAddress;

	// only expects integer
	const slippage = (extra.slippage * 100) | 0;

	// only fetch permit api quote if user is connected
	const [permitApiQuote, allowanceHolderApiQuote] = await Promise.all([
		extra.userAddress !== '0x0000000000000000000000000000000000000000'
			? fetch(
					`https://api.0x.org/swap/permit2/quote?chainId=${chainToId[chain]}&buyToken=${tokenTo}&${amountParam}&sellToken=${tokenFrom}&slippageBps=${slippage}&taker=${taker}&tradeSurplusRecipient=${feeCollectorAddress}`,
					{
						headers: {
							'0x-api-key': process.env.OX_API_KEY,
							'0x-version': 'v2'
						}
					}
				).then(async (r) => {
					if (r.status !== 200) {
						throw new Error('Failed to fetch');
					}

					const data = await r.json();

					return data;
				})
			: null,
		fetch(
			`https://api.0x.org/swap/allowance-holder/quote?chainId=${chainToId[chain]}&buyToken=${tokenTo}&${amountParam}&sellToken=${tokenFrom}&slippageBps=${slippage}&taker=${taker}&tradeSurplusRecipient=${feeCollectorAddress}`,
			{
				headers: {
					'0x-api-key': process.env.OX_API_KEY,
					'0x-version': 'v2'
				}
			}
		).then(async (r) => {
			if (r.status !== 200) {
				throw new Error('Failed to fetch');
			}

			const data = await r.json();

			return data;
		})
	]);

	let isPermitSwap = false;

	// check for traditional swap approval address allowance
	// if it's already approved then swap via allowance-holder api
	const isApprovedForTraditionalSwap = allowanceHolderApiQuote.issues?.allowance?.spender
		? await isTokenApproved({
				token: tokenFrom,
				chain,
				address: taker,
				spender: allowanceHolderApiQuote.issues?.allowance.spender,
				amount
			})
		: true;

	if (!isApprovedForTraditionalSwap && permitApiQuote) {
		// if user has enough allowance for permit2Address then permit2 will be null
		// no need for approval signature, but user can sign -> swap via permit2 instead of approving spender from allowanceHolderApiQuote -> swap
		if (permitApiQuote.permit2 === null) {
			isPermitSwap = true;
		} else {
			// check if permit2 contract approval address matches
			if (
				permitApiQuote.permit2 !== null &&
				permitApiQuote.permit2.eip712.domain.verifyingContract.toLowerCase() !== permit2Address.toLowerCase()
			) {
				throw new Error(`Approval address does not match`);
			}

			// check for permit2 contract approval address allowance
			// if already approved -> swap via permit, else swap via traditional swap flow (so we can skip signature part)
			const isApprovedForPermitSwap = await isTokenApproved({
				token: tokenFrom,
				chain,
				address: taker,
				spender: permit2Address,
				amount
			});

			isPermitSwap = isApprovedForPermitSwap;
		}
	}

	const data = isPermitSwap ? permitApiQuote : allowanceHolderApiQuote;

	return {
		amountReturned: data?.buyAmount || 0,
		amountIn: data?.sellAmount || 0,
		tokenApprovalAddress: isPermitSwap ? permit2Address : allowanceHolderApiQuote?.issues?.allowance?.spender ?? null,
		estimatedGas: data.transaction.gas,
		rawQuote: { ...data, gasLimit: data.transaction.gas },
		isSignatureNeededForSwap: isPermitSwap ? true : false,
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

	const signatureLengthInHex = ethers.utils.hexValue(ethers.utils.hexDataLength(signature));

	const tx = await sendTx(signer, chain, {
		from: fromAddress,
		to: rawQuote.transaction.to,
		// signature not needed for unwrapping native tokens
		data: signature
			? rawQuote.transaction.data.includes(MAGIC_CALLDATA_STRING)
				? rawQuote.transaction.data.replace(MAGIC_CALLDATA_STRING, signature.slice(2))
				: [rawQuote.transaction.data, signatureLengthInHex, signature].join('')
			: rawQuote.transaction.data,
		value: rawQuote.transaction.value
	});

	return tx;
}

export const getTxData = ({ rawQuote }) => rawQuote?.transaction?.data;

export const getTx = ({ rawQuote }) => ({
	to: rawQuote.transaction.to,
	data: rawQuote.transaction.data,
	value: rawQuote.transaction.value
});

async function isTokenApproved({ token, chain, amount, address, spender }) {
	try {
		const allowance = await getAllowance({
			token,
			chain,
			address,
			spender
		});

		const isOld = token ? oldErc.includes(token.toLowerCase()) : false;

		const shouldRemoveApproval =
			isOld &&
			allowance &&
			amount &&
			!Number.isNaN(Number(amount)) &&
			allowance.lt(BigNumber.from(amount)) &&
			!allowance.eq(0);

		if (!shouldRemoveApproval && allowance.gte(BigNumber.from(amount))) {
			return true;
		}

		return false;
	} catch (error) {
		return false;
	}
}
