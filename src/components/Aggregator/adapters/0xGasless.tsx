import { ethers } from 'ethers';
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

	// do not show quote if there's not enough liquidity or gasless swap is not available for the sell token
	// can only initiate gasless approval for sell token if isGaslessAvailable & isRequired are true
	if (!data.liquidityAvailable || !data.approval?.isGaslessAvailable || !data.approval?.isRequired) return null;

	return {
		amountReturned: data?.buyAmount || 0,
		amountIn: data?.sellAmount || 0,
		rawQuote: data,
		logo: 'https://www.gitbook.com/cdn-cgi/image/width=40,height=40,fit=contain,dpr=2,format=auto/https%3A%2F%2F1690203644-files.gitbook.io%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FKX9pG8rH3DbKDOvV7di7%252Ficon%252F1nKfBhLbPxd2KuXchHET%252F0x%2520logo.png%3Falt%3Dmedia%26token%3D25a85a3e-7f72-47ea-a8b2-e28c0d24074b'
	};
}

export async function swap({ signTypedDataAsync, rawQuote, chain }) {
	// user must sign approval.eip712 and the trade.eip712 objects returned by /quote for gasless approvals
	const approvalSignature = await signTypedDataAsync({
		domain: rawQuote.approval.eip712.domain,
		types: rawQuote.approval.eip712.types,
		primaryType: rawQuote.approval.eip712.primaryType,
		value: rawQuote.approval.eip712.message
	}).then((hash) => ethers.utils.splitSignature(hash));
	const tradeSignature = await signTypedDataAsync({
		domain: rawQuote.trade.eip712.domain,
		types: rawQuote.trade.eip712.types,
		primaryType: rawQuote.trade.eip712.primaryType,
		value: rawQuote.trade.eip712.message
	}).then((hash) => ethers.utils.splitSignature(hash));

	const tx = await fetch(`https://api.0x.org/tx-relay/v1/swap/submit`, {
		headers: {
			'0x-api-key': 'e3fae20a-652c-4341-8013-7de52e31029b',
			'0x-chain-id': chainToId[chain],
			'Content-Type': 'application/json'
		},
		method: 'POST',
		body: JSON.stringify({
			trade: {
				type: rawQuote.trade.type,
				eip712: rawQuote.trade.eip712,
				signature: {
					v: tradeSignature.v,
					r: tradeSignature.r,
					s: tradeSignature.s,
					signatureType: '2' // type of eip712
				}
			},
			approval: {
				type: rawQuote.approval.type,
				eip712: rawQuote.approval.eip712,
				signature: {
					v: approvalSignature.v,
					r: approvalSignature.r,
					s: approvalSignature.s,
					signatureType: '2' // type of eip712
				}
			}
		})
	})
		.then((r) => r.json())
		.catch((err) => {
			console.log({ err });
		});

	const txStatus = await fetch(`https://api.0x.org/tx-relay/v1/swap/status/${tx.tradeHash}`, {
		headers: {
			'0x-api-key': 'e3fae20a-652c-4341-8013-7de52e31029b',
			'0x-chain-id': chainToId[chain]
		}
	}).then((res) => res.json());

	return { txStatus };
}

export const getTxData = ({ rawQuote }) => rawQuote?.data;

export const getTx = ({ rawQuote }) => ({
	to: rawQuote.to,
	data: rawQuote.data,
	value: rawQuote.value
});
