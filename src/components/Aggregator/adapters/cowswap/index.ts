// Source: https://docs.cow.fi/off-chain-services/api

import { ExtraData } from '../../types';
import { domain, SigningScheme, signOrder, OrderKind } from '@gnosis.pm/gp-v2-contracts';
import GPv2SettlementArtefact from '@gnosis.pm/gp-v2-contracts/deployments/mainnet/GPv2Settlement.json';

import { ethers } from 'ethers';
import { ABI } from './abi';

export const chainToId = {
	ethereum: 'https://api.cow.fi/mainnet',
	gnosis: 'https://api.cow.fi/xdai'
};

const wrappedTokens = {
	ethereum: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
	gnosis: '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d'
};

const nativeSwapAddress = {
	ethereum: '0x40A50cf069e992AA4536211B23F286eF88752187',
	gnosis: '0x40A50cf069e992AA4536211B23F286eF88752187'
};

export const name = 'CowSwap';
export const token = 'COW';
export const referral = true;

export function approvalAddress() {
	return '0xC92E8bdf79f0507f65a392b0ab4667716BFE0110';
}
const nativeToken = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

const waitForOrder = (uid, provider, trader) => async (onSuccess) => {
	let n = 0;
	const settlement = new ethers.Contract(
		'0x9008D19f58AAbD9eD0D60971565AA8510560ab41',
		GPv2SettlementArtefact.abi,
		provider
	);
	provider.on(settlement.filters.Trade(trader), (log) => {
		if (log.data.includes(uid.substring(2)) && n === 0) {
			onSuccess();
			n++;
		}
	});
};

// https://docs.cow.fi/tutorials/how-to-submit-orders-via-the-api/2.-query-the-fee-endpoint
export async function getQuote(chain: string, from: string, to: string, amount: string, extra: ExtraData) {
	const tokenTo = to === ethers.constants.AddressZero ? nativeToken : to;
	const tokenFrom = from === ethers.constants.AddressZero ? wrappedTokens[chain] : from;
	// amount should include decimals
	const data = await fetch(`${chainToId[chain]}/api/v1/quote`, {
		method: 'POST',
		body: JSON.stringify({
			sellToken: tokenFrom,
			buyToken: tokenTo,
			receiver: extra.userAddress,
			appData: '0xf249b3db926aa5b5a1b18f3fec86b9cc99b9a8a99ad7e8034242d2838ae97422', // generated using https://explorer.cow.fi/appdata?tab=encode
			partiallyFillable: false,
			sellTokenBalance: 'erc20',
			buyTokenBalance: 'erc20',
			from: extra.userAddress,
			//"priceQuality": "fast",
			signingScheme: 'ethsign',
			//"onchainOrder": false,
			kind: 'sell',
			sellAmountBeforeFee: amount
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	}).then((r) => r.json());

	return {
		amountReturned: data.quote?.buyAmount || 0,
		estimatedGas: 0,
		feeAmount: data.quote?.feeAmount || 0,
		validTo: data.quote?.validTo || 0,
		rawQuote: data,
		tokenApprovalAddress: '0xC92E8bdf79f0507f65a392b0ab4667716BFE0110',
		logo: 'https://assets.coingecko.com/coins/images/24384/small/cow.png?1660960589'
	};
}

export async function swap({ chain, signer, rawQuote, from, to }) {
	const fromAddress = await signer.getAddress();

	if (from === ethers.constants.AddressZero) {
		const nativeSwap = new ethers.Contract(nativeSwapAddress[chain], ABI.natviveSwap, signer);

		const tx = await nativeSwap.createOrder(
			[
				to,
				fromAddress,
				rawQuote.quote.sellAmount,
				rawQuote.quote.buyAmount,
				rawQuote.quote.appData,
				rawQuote.quote.feeAmount,
				rawQuote.quote.validTo,
				rawQuote.quote.partiallyFillable,
				rawQuote.id
			],
			{ value: Number(rawQuote.quote.sellAmount) + Number(rawQuote.quote.feeAmount) }
		);

		return tx;
	} else {
		const order = {
			sellToken: rawQuote.quote.sellToken,
			buyToken: rawQuote.quote.buyToken,
			sellAmount: rawQuote.quote.sellAmount,
			buyAmount: rawQuote.quote.buyAmount,
			validTo: rawQuote.quote.validTo,
			appData: rawQuote.quote.appData,
			receiver: fromAddress,
			feeAmount: rawQuote.quote.feeAmount,
			kind: OrderKind.SELL,
			partiallyFillable: rawQuote.quote.partiallyFillable
		};

		const rawSignature = await signOrder(
			domain(1, '0x9008D19f58AAbD9eD0D60971565AA8510560ab41'),
			order,
			signer,
			SigningScheme.ETHSIGN
		);

		const signature = ethers.utils.joinSignature(rawSignature.data);

		const data = await fetch(`${chainToId[chain]}/api/v1/orders`, {
			method: 'POST',
			body: JSON.stringify({
				...rawQuote.quote,
				signature,
				signingScheme: 'ethsign'
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		}).then((r) => r.json());

		if (data.errorType) throw { reason: data.description };

		return { id: data, waitForOrder: waitForOrder(data, signer.provider, fromAddress) };
	}
}

export const getTxData = () => '';

export const getTx = () => ({});
