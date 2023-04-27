// Source: https://docs.cow.fi/off-chain-services/api

import { ExtraData } from '../../types';
import { domain, SigningScheme, signOrder, OrderKind } from '@gnosis.pm/gp-v2-contracts';
import GPv2SettlementArtefact from '@gnosis.pm/gp-v2-contracts/deployments/mainnet/GPv2Settlement.json';

import { ethers } from 'ethers';
import { ABI } from './abi';
import BigNumber from 'bignumber.js';
import { chainsMap } from '../../constants';

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
export const isOutputAvailable = true;

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
	const isEthflowOrder = from === ethers.constants.AddressZero;
	const tokenTo = to === ethers.constants.AddressZero ? nativeToken : to;
	const tokenFrom = isEthflowOrder ? wrappedTokens[chain] : from;
	const isBuyOrder = extra.amountOut && extra.amountOut !== '0';
	
	// Ethflow orders are always sell orders.
	// Source: https://github.com/cowprotocol/ethflowcontract/blob/v1.0.0/src/libraries/EthFlowOrder.sol#L93-L95
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
			appData: '0xf249b3db926aa5b5a1b18f3fec86b9cc99b9a8a99ad7e8034242d2838ae97422', // generated using https://explorer.cow.fi/appdata?tab=encode
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
		throw new Error('Buggy quote from cowswap');
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
		estimatedGas: isEthflowOrder ? 56360 : 0, // 56360 is gas from sending createOrder() tx
		validTo: data.quote?.validTo || 0,
		rawQuote: { ...data, slippage: extra.slippage },
		tokenApprovalAddress: '0xC92E8bdf79f0507f65a392b0ab4667716BFE0110',
		logo: 'https://assets.coingecko.com/coins/images/24384/small/cow.png?1660960589',
		isMEVSafe: true
	};
}

export async function swap({ chain, signer, rawQuote, from, to }) {
	const fromAddress = await signer.getAddress();

	if (from === ethers.constants.AddressZero) {
		const nativeSwap = new ethers.Contract(nativeSwapAddress[chain], ABI.natviveSwap, signer);

		if (rawQuote.slippage < 2) {
			throw { reason: 'Slippage for ETH orders on CowSwap needs to be higher than 2%' };
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
			domain(chainsMap[chain], '0x9008D19f58AAbD9eD0D60971565AA8510560ab41'),
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
