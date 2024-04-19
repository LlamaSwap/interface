import { BigNumber, ethers } from 'ethers';
import { defillamaReferrerAddress } from '../constants';

export const chainToId = {
	ethereum: '1',
	polygon: '137',
	optimism: '10',
	arbitrum: '42161',
	base: '8453'
};

export const name = 'Matcha/0x Gasless';
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

	const tokenFrom = from === ethers.constants.AddressZero ? nativeToken : from;
	const tokenTo = to === ethers.constants.AddressZero ? nativeToken : to;
	const amountParam =
		extra.amountOut && extra.amountOut !== '0' ? `buyAmount=${extra.amountOut}` : `sellAmount=${amount}`;

	const data = await fetch(
		`https://api.0x.org/tx-relay/v1/swap/quote?buyToken=${tokenTo}&${amountParam}&sellToken=${tokenFrom}&checkApproval=true&slippagePercentage=${
			extra.slippage / 100
		}&affiliateAddress=${defillamaReferrerAddress}&takerAddress=${
			extra.userAddress
		}&feeRecipient=${feeCollectorAddress}`,
		{
			headers: {
				'0x-api-key': 'e3fae20a-652c-4341-8013-7de52e31029b',
				'0x-chain-id': chainToId[chain]
			}
		}
	).then((r) => r.json());

	// do not show quote if there's not enough liquidity
	if (!data.liquidityAvailable) return null;

	// hide quote if it's unknown gasless approval signature
	if (
		data.approval.isRequired &&
		data.approval.isGaslessAvailable &&
		!['Permit', 'MetaTransaction'].includes(data.approval.eip712.primaryType)
	)
		return null;

	let spender;

	if (data.approval.eip712.primaryType === 'Permit') {
		spender = data.approval.eip712.message.spender;
	}

	if (data.approval.eip712.primaryType === 'MetaTransaction') {
		spender = new ethers.utils.Interface(['function approve(address, uint)']).decodeFunctionData(
			'approve',
			data.approval.eip712.message.functionSignature
		)[0];
	}

	if (
		data.allowanceTarget.toLowerCase() !== routers[chain].toLowerCase() ||
		!spender ||
		spender.toLowerCase() !== routers[chain].toLowerCase() ||
		data.trade.eip712.domain.verifyingContract.toLowerCase() !== routers[chain].toLowerCase()
	) {
		throw new Error(`Router address does not match`);
	}

	return {
		amountReturned: data.buyAmount,
		amountIn: data.sellAmount,
		rawQuote: data,
		tokenApprovalAddress: data.allowanceTarget ?? null,
		logo: 'https://www.gitbook.com/cdn-cgi/image/width=40,height=40,fit=contain,dpr=2,format=auto/https%3A%2F%2F1690203644-files.gitbook.io%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FKX9pG8rH3DbKDOvV7di7%252Ficon%252F1nKfBhLbPxd2KuXchHET%252F0x%2520logo.png%3Falt%3Dmedia%26token%3D25a85a3e-7f72-47ea-a8b2-e28c0d24074b'
	};
}

export async function gaslessApprove({ signTypedDataAsync, rawQuote, isInfiniteApproval }) {
	const body: any = {};

	if (rawQuote.approval.isRequired && rawQuote.approval.isGaslessAvailable) {
		const value = isInfiniteApproval
			? rawQuote.approval.eip712.message
			: rawQuote.approval.eip712.primaryType === 'Permit'
			? {
					...rawQuote.approval.eip712.message,
					value: rawQuote.sellAmount
			  }
			: rawQuote.approval.eip712.primaryType === 'MetaTransaction'
			? {
					...rawQuote.approval.eip712.message,
					functionSignature: new ethers.utils.Interface(['function approve(address, uint)']).encodeFunctionData(
						'approve',
						[ethers.utils.getAddress(rawQuote.allowanceTarget), BigNumber.from(rawQuote.sellAmount)]
					)
			  }
			: rawQuote.approval.eip712.message;

		const approvalSignature = await signTypedDataAsync({
			domain: rawQuote.approval.eip712.domain,
			types: rawQuote.approval.eip712.types,
			primaryType: rawQuote.approval.eip712.primaryType,
			value
		}).then((hash) => ethers.utils.splitSignature(hash));

		body.approval = {
			type: rawQuote.approval.type,
			eip712: { ...rawQuote.approval.eip712, message: value },
			signature: {
				v: approvalSignature.v,
				r: approvalSignature.r,
				s: approvalSignature.s,
				recoveryParam: approvalSignature.recoveryParam,
				signatureType: 2
			}
		};
	}

	return body;
}
export async function swap({ signTypedDataAsync, rawQuote, chain, approvalData }) {
	const body = { ...(approvalData ?? {}) };

	const tradeSignature = await signTypedDataAsync({
		domain: rawQuote.trade.eip712.domain,
		types: rawQuote.trade.eip712.types,
		primaryType: rawQuote.trade.eip712.primaryType,
		value: rawQuote.trade.eip712.message
	}).then((hash) => ethers.utils.splitSignature(hash));

	body.trade = {
		type: rawQuote.trade.type,
		eip712: rawQuote.trade.eip712,
		signature: {
			v: tradeSignature.v,
			r: tradeSignature.r,
			s: tradeSignature.s,
			recoveryParam: tradeSignature.recoveryParam,
			signatureType: 2
		}
	};

	const tx = await fetch(`https://api.0x.org/tx-relay/v1/swap/submit`, {
		headers: {
			'0x-api-key': 'e3fae20a-652c-4341-8013-7de52e31029b',
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

	const gaslessTxReceipt = await fetch(`https://api.0x.org/tx-relay/v1/swap/status/${tx.tradeHash}`, {
		headers: {
			'0x-api-key': 'e3fae20a-652c-4341-8013-7de52e31029b',
			'0x-chain-id': chainToId[chain]
		}
	}).then((res) => res.json());

	return { gaslessTxReceipt };
}
