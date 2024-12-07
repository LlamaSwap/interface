import { defillamaReferrerAddress, tokenApprovalAbi } from '../constants';
import { decodeFunctionData, encodeFunctionData, getAddress, hexToNumber, parseSignature, zeroAddress } from 'viem';
import { signTypedData } from 'wagmi/actions';
import { config } from '../../WalletProvider';

export const chainToId = {
	ethereum: '1',
	polygon: '137',
	optimism: '10',
	arbitrum: '42161',
	base: '8453'
};

export const name = '0x Gasless';
export const token = 'ZRX';

const nativeToken = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
const feeCollectorAddress = '0x9Ab6164976514F1178E2BB4219DA8700c9D96E9A';

export const isGasless = true;

export const isOutputAvailable = true;

const routers = {
	ethereum: '0xdef1c0ded9bec7f1a1670819833240f027b25eff',
	arbitrum: '0xdef1c0ded9bec7f1a1670819833240f027b25eff',
	optimism: '0xdef1abe32c034e558cdd535791643c58a13acc10',
	base: '0xdef1c0ded9bec7f1a1670819833240f027b25eff',
	polygon: '0xdef1c0ded9bec7f1a1670819833240f027b25eff'
};

export async function getQuote(chain: string, from: string, to: string, amount: string, extra) {
	// amount should include decimals

	const tokenFrom = from === zeroAddress ? nativeToken : from;
	const tokenTo = to === zeroAddress ? nativeToken : to;
	const amountParam =
		extra.amountOut && extra.amountOut !== '0' ? `buyAmount=${extra.amountOut}` : `sellAmount=${amount}`;

	const data = await fetch(
		`https://api.0x.org/tx-relay/v1/swap/quote?buyToken=${tokenTo}&${amountParam}&sellToken=${tokenFrom}&checkApproval=true&slippagePercentage=${
			extra.slippage / 100
		}&affiliateAddress=${defillamaReferrerAddress}&takerAddress=${
			extra.userAddress
		}&feeRecipient=${feeCollectorAddress}&feeSellTokenPercentage=0.0015`,
		{
			headers: {
				'0x-api-key': process.env.OX_API_KEY as string,
				'0x-chain-id': chainToId[chain]
			}
		}
	).then((r) => r.json());

	// do not show quote if there's not enough liquidity
	if (!data.liquidityAvailable) return null;

	// hide quote if it's unknown gasless approval signature
	if (data.approval.isRequired && data.approval.isGaslessAvailable) {
		if (!['Permit'].includes(data.approval.eip712.primaryType)) {
			return null;
		}

		let spender;

		if (data.approval.eip712.primaryType === 'Permit') {
			spender = data.approval.eip712.message.spender;
		}

		if (data.approval.eip712.primaryType === 'MetaTransaction') {
			spender = decodeFunctionData({
				abi: tokenApprovalAbi,
				data: data.approval.eip712.message.functionSignature
			}).args[0];
		}

		if (!spender || spender.toLowerCase() !== routers[chain].toLowerCase()) {
			throw new Error(`Router address does not match`);
		}
	}

	if (
		data.allowanceTarget.toLowerCase() !== routers[chain].toLowerCase() ||
		data.trade.eip712.domain.verifyingContract.toLowerCase() !== routers[chain].toLowerCase()
	) {
		throw new Error(`Router address does not match`);
	}

	const isGaslessApproval = data.approval.isRequired && data.approval.isGaslessAvailable ? true : false;

	return {
		amountReturned: data.buyAmount,
		amountIn: data.sellAmount,
		rawQuote: data,
		estimatedGas: 0, // Currently swaps from ETH are not supported, so we don't handle gas costs for them
		tokenApprovalAddress: data.allowanceTarget ?? null,
		isGaslessApproval,
		isMEVSafe: true,
		logo: 'https://www.gitbook.com/cdn-cgi/image/width=40,height=40,fit=contain,dpr=2,format=auto/https%3A%2F%2F1690203644-files.gitbook.io%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FKX9pG8rH3DbKDOvV7di7%252Ficon%252F1nKfBhLbPxd2KuXchHET%252F0x%2520logo.png%3Falt%3Dmedia%26token%3D25a85a3e-7f72-47ea-a8b2-e28c0d24074b'
	};
}

export async function gaslessApprove({ rawQuote, isInfiniteApproval }) {
	const body: any = {};

	if (rawQuote.approval.isRequired && rawQuote.approval.isGaslessAvailable) {
		const message = isInfiniteApproval
			? rawQuote.approval.eip712.message
			: rawQuote.approval.eip712.primaryType === 'Permit'
				? {
						...rawQuote.approval.eip712.message,
						value: rawQuote.sellAmount
					}
				: rawQuote.approval.eip712.primaryType === 'MetaTransaction'
					? {
							...rawQuote.approval.eip712.message,
							functionSignature: encodeFunctionData({
								abi: tokenApprovalAbi,
								functionName: 'approve',
								args: [getAddress(rawQuote.allowanceTarget), rawQuote.sellAmount]
							})
						}
					: null;

		const approvalSignature = await signTypedData(config, {
			domain: rawQuote.approval.eip712.domain,
			types: rawQuote.approval.eip712.types,
			primaryType: rawQuote.approval.eip712.primaryType,
			message
		}).then((hash) => {
			const { r, s } = parseSignature(hash);
			return { v: hexToNumber(`0x${hash.slice(130)}`), r, s };
		});

		body.approval = {
			type: rawQuote.approval.type,
			eip712: { ...rawQuote.approval.eip712, message },
			signature: padSignature({
				v: approvalSignature.v,
				r: approvalSignature.r,
				s: approvalSignature.s,
				recoveryParam: 1 - (approvalSignature.v % 2),
				signatureType: 2
			})
		};
	}

	return body;
}

// https://github.com/0xProject/0x-examples/blob/main/gasless-v2-headless-example/utils/signature.ts
/**
 * Sometimes signatures are split without leading bytes on the `r` and/or `s` fields.
 *
 * Add them if they don't exist.
 */
function padSignature(signature) {
	const hexLength = 64;

	const result = { ...signature };

	const hexExtractor = /^0(x|X)(?<hex>\w+)$/;
	const rMatch = signature.r.match(hexExtractor);
	const rHex = rMatch?.groups?.hex;
	if (rHex) {
		if (rHex.length !== hexLength) {
			result.r = `0x${rHex.padStart(hexLength, '0')}`;
		}
	}

	const sMatch = signature.s.match(hexExtractor);
	const sHex = sMatch?.groups?.hex;
	if (sHex) {
		if (sHex.length !== hexLength) {
			result.s = `0x${sHex.padStart(hexLength, '0')}`;
		}
	}
	return result;
}

export async function swap({ rawQuote, chain, approvalData }) {
	const body = { ...(rawQuote.approval.isRequired && rawQuote.approval.isGaslessAvailable ? approvalData ?? {} : {}) };

	const tradeSignature = await signTypedData(config, {
		domain: rawQuote.trade.eip712.domain,
		types: rawQuote.trade.eip712.types,
		primaryType: rawQuote.trade.eip712.primaryType,
		message: rawQuote.trade.eip712.message
	}).then((hash) => {
		const { r, s } = parseSignature(hash);
		return { v: hexToNumber(`0x${hash.slice(130)}`), r, s };
	});

	body.trade = {
		type: rawQuote.trade.type,
		eip712: rawQuote.trade.eip712,
		signature: padSignature({
			v: tradeSignature.v,
			r: tradeSignature.r,
			s: tradeSignature.s,
			recoveryParam: 1 - (tradeSignature.v % 2),
			signatureType: 2
		})
	};

	const res = await fetch(
		`https://swap-api.defillama.com/submitSwap?protocol=${encodeURIComponent(
			name
		)}&chain=${chain}&api_key=nsr_UYWxuvj1hOCgHxJhDEKZ0g30c4Be3I5fOMBtFAA`,
		{
			method: 'POST',
			body: JSON.stringify(body)
		}
	).then((res) => res.json());
	return res;
}

export async function submitSwap({ chain, body }) {
	const tx = await fetch(`https://api.0x.org/tx-relay/v1/swap/submit`, {
		headers: {
			'0x-api-key': process.env.OX_API_KEY as string,
			'0x-chain-id': chainToId[chain],
			'Content-Type': 'application/json'
		},
		method: 'POST',
		body: JSON.stringify(body)
	})
		.then((r) => r.json())
		.catch((err) => {
			console.log({ err });
		});

	if (!tx.tradeHash) {
		return {
			gaslessTxReceipt: {
				status: 'failed',
				reason: tx.validationErrors
					? tx.validationErrors.map((t) => t.reason).join(', ')
					: tx.reason ?? 'Something went wrong'
			}
		};
	}

	let gaslessTxReceipt;
	let runs = 0;
	do {
		runs += 1;

		gaslessTxReceipt = await fetch(`https://api.0x.org/tx-relay/v1/swap/status/${tx.tradeHash}`, {
			headers: {
				'0x-api-key': process.env.OX_API_KEY as string,
				'0x-chain-id': chainToId[chain]
			}
		}).then((res) => res.json());

		if (gaslessTxReceipt.status !== 'pending') {
			return { gaslessTxReceipt };
		} else {
			// sleep for 5 seconds
			await sleep(5_000);
		}
	} while (gaslessTxReceipt.status === 'pending' && runs < 12); // keep querying status upto a min

	return { gaslessTxReceipt };
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
