// UniDex adapter for the aggregator which is a wrapper around the CowSwap API for mainnet and the MetaAggregator API for other chains.
// For Llamaswap, the CowSwap and UniDex API is the same, so we can plug in a similar integration but using UniDex for other chains.
// The order flow is the same as for CowSwap, but the solver mechanism is different. Orders are more like RFQ + market makers, but falling back on existing aggregators llama already supports.

import { ExtraData } from '../../types';
import { domain, SigningScheme, signOrder, OrderKind } from '@gnosis.pm/gp-v2-contracts';
import GPv2SettlementArtefact from '@gnosis.pm/gp-v2-contracts/deployments/mainnet/GPv2Settlement.json';

import { ethers } from 'ethers';
import { ABI } from './abi';
import BigNumber from 'bignumber.js';
import { chainsMap } from '../../constants';

export const chainToId = {
	arbitrum: 'https://arbitrum.metaaggregator.io',
	optimism: 'https://optimism.metaaggregator.io',
	polygon: 'https://polygon.metaaggregator.io',
	fantom: 'https://fantom.metaaggregator.io'
};

const wrappedTokens = {
	arbitrum: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
	optimism: '0x4200000000000000000000000000000000000006',
	polygon: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
	fantom: '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83'
};

const nativeSwapAddress = {
	arbitrum: '0x970a0575a3e5a1c76493b5744b90bd0a490b0886',
	optimism: '0x970a0575a3e5a1c76493b5744b90bd0a490b0886',
	polygon: '0x970a0575a3e5a1c76493b5744b90bd0a490b0886',
	fantom: '0x970a0575a3e5a1c76493b5744b90bd0a490b0886'
};

export const name = 'UniDex';
export const token = 'UNIDX';
export const referral = true;
export const isOutputAvailable = true;

export function approvalAddress() {
	return '0x74B634FD78cC9836A9B2b2f946749Fd163C1D60C';
}
const nativeToken = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

const waitForOrder = (uid, provider, trader) => async (onSuccess) => {
	let n = 0;
	const settlement = new ethers.Contract(
		'0x103d0634ec6c9e1f633381b16f8e2fe56a2e7372',
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

export async function getQuote(chain: string, from: string, to: string, amount: string, extra: ExtraData) {
	const isEthflowOrder = from === ethers.constants.AddressZero;
	const tokenTo = to === ethers.constants.AddressZero ? nativeToken : to;
	const tokenFrom = isEthflowOrder ? wrappedTokens[chain] : from;
	const isBuyOrder = extra.amountOut && extra.amountOut !== '0';
	
	if (isEthflowOrder && isBuyOrder) {
		throw new Error('buy orders from Ether are not allowed');
	}
	
	// amount should include decimals
	const data = await fetch(`${chainToId[chain]}/api/v1/quote`, {
		method: 'POST',
		body: JSON.stringify({
			sellToken: tokenFrom,
			buyToken: tokenTo,
			receiver: extra.userAddress,
			appData: '0xf249b3db926aa5b5a1b18f3fec86b9cc99b9a8a99ad7e8034242d2838ae97422', // generated using https://explorer.cow.fi/appdata?tab=encode replicated here for convenience
			partiallyFillable: false,
			sellTokenBalance: 'erc20',
			buyTokenBalance: 'erc20',
			from: extra.userAddress,
			//"priceQuality": "fast",
			signingScheme: isEthflowOrder ? 'eip1271' : 'eip712', // for selling directly ether, another signature type is required
			onchainOrder: isEthflowOrder ? true : false, // for selling directly ether, we have to quote for onchain orders
			kind: isBuyOrder ? 'buy' : 'sell',
			...(isBuyOrder ? { buyAmountAfterFee: extra.amountOut } : { sellAmountBeforeFee: amount })
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	}).then((r) => r.json());
	// These orders should never be sent, but if they ever are signed they could be used to drain account
	// Source: https://docs.cow.fi/tutorials/how-to-submit-orders-via-the-api/4.-signing-the-order
	if (data.quote.sellAmount === 0 && data.quote.buyAmount === 0 && data.quote.partiallyFillable === false) {
		throw new Error('Buggy quote from unidex');
	}

	const expectedBuyAmount = data.quote.buyAmount;
	const expectedSellAmount = BigNumber(data?.quote.sellAmount).plus(data.quote.feeAmount).toFixed(0);
	if (isBuyOrder) {
		data.quote.sellAmount = BigNumber(data.quote.sellAmount)
			.times(1 + Number(extra.slippage) / 100)
			.toFixed(0);
	} else {
		data.quote.buyAmount = BigNumber(expectedBuyAmount)
			.times(1 - Number(extra.slippage) / 100)
			.toFixed(0);
	}

	return {
		amountReturned: expectedBuyAmount,
		amountIn: expectedSellAmount || '0',
		estimatedGas: isEthflowOrder ? 56360 : 0,
		validTo: data.quote?.validTo || 0,
		rawQuote: { ...data, slippage: extra.slippage },
		tokenApprovalAddress: '0x74B634FD78cC9836A9B2b2f946749Fd163C1D60C',
		logo: 'https://assets.coingecko.com/coins/images/13178/small/unidx.png?1634888975',
		isMEVSafe: true
	};
}

export async function swap({ chain, signer, rawQuote, from, to }) {
	const fromAddress = await signer.getAddress();

	if (from === ethers.constants.AddressZero) {
		const nativeSwap = new ethers.Contract(nativeSwapAddress[chain], ABI.natviveSwap, signer);

		if (rawQuote.slippage < 1) {
			throw { reason: 'Slippage for ETH orders on UniDex needs to be higher than 1%' };
		}

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
			{ value: BigNumber(rawQuote.quote.sellAmount).plus(rawQuote.quote.feeAmount).toFixed(0) }
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
			kind: rawQuote.quote.kind,
			partiallyFillable: rawQuote.quote.partiallyFillable
		};

		const rawSignature = await signOrder(
			domain(chainsMap[chain], '0x103d0634ec6c9e1f633381b16f8e2fe56a2e7372'),
			order,
			signer,
			SigningScheme.EIP712
		);

		const signature = ethers.utils.joinSignature(rawSignature.data);

		const data = await fetch(`${chainToId[chain]}/api/v1/orders`, {
			method: 'POST',
			body: JSON.stringify({
				...rawQuote.quote,
				signature,
				signingScheme: 'eip712'
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
