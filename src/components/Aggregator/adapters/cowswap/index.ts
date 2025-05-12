// Source: https://docs.cow.fi/off-chain-services/api

import { ExtraData } from '../../types';

import BigNumber from 'bignumber.js';
import { zeroAddress } from 'viem';
import { signTypedData, watchContractEvent, writeContract } from 'wagmi/actions';
import { config } from '../../../WalletProvider';
import { chainsMap } from '../../constants';
import { ABI } from './abi';

export const chainToId = {
	ethereum: 'https://api.cow.fi/mainnet',
	gnosis: 'https://api.cow.fi/xdai',
	arbitrum: 'https://api.cow.fi/arbitrum_one'
	base: 'https://api.cow.fi/base'
};

const wrappedTokens = {
	ethereum: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
	gnosis: '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d',
	arbitrum: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
	base: '0x4200000000000000000000000000000000000006'
};

const cowContractAddress = '0xC92E8bdf79f0507f65a392b0ab4667716BFE0110';
const cowSwapEthFlowContractAddress = '0xba3cb449bd2b4adddbc894d8697f5170800eadec';

const nativeSwapAddress = {
	ethereum: cowSwapEthFlowContractAddress,
	gnosis: cowSwapEthFlowContractAddress,
	arbitrum: cowSwapEthFlowContractAddress,
	base: cowSwapEthFlowContractAddress
};

export const name = 'CoW Swap';
export const token = 'COW';
export const referral = true;
export const isOutputAvailable = true;

export function approvalAddress() {
	return cowContractAddress;
}
const nativeToken = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

const feeRecipientAddress = '0x1713B79e3dbb8A76D80e038CA701A4a781AC69eB';

function buildAppData(slippage: string) {
	// Convert slippage to basis points
	const bps = Math.round(Number(slippage) * 100);
	// Must be an integer between 0 and 10000
	const slippageBips = isNaN(bps) || bps < 0 || bps > 10000 ? undefined : bps;

	return JSON.stringify({
		version: '1.4.0',
		appCode: 'DefiLlama',
		environment: 'production',
		metadata: {
			orderClass: {
				orderClass: 'market'
			},
			partnerFee: [
				{
					priceImprovementBps: 5000, // Capture 50% of the price improvement
					maxVolumeBps: 100, // Capped at 1% volume
					recipient: feeRecipientAddress
				}
			],
			// Include slippage in the appData if there's a valid value provided
			...(slippageBips ? { quote: { slippageBips } } : undefined)
		}
	});
}

const waitForOrder =
	({ uid, trader, chain }) =>
	(onSuccess) => {
		const unwatch = watchContractEvent(config, {
			address: '0x9008D19f58AAbD9eD0D60971565AA8510560ab41',
			abi: ABI.settlement,
			eventName: 'Trade',
			args: { owner: trader },
			chainId: chainsMap[chain],
			onLogs(logs) {
				const trade = logs.find((log) => log.data.includes(uid.substring(2)));
				if (trade) {
					onSuccess();
					unwatch();
				}
			},
			onError(error) {
				console.log('Error confirming order status', error);
				unwatch();
			}
		});
	};

// https://docs.cow.fi/tutorials/how-to-submit-orders-via-the-api/2.-query-the-fee-endpoint
export async function getQuote(chain: string, from: string, to: string, amount: string, extra: ExtraData) {
	const isEthflowOrder = from === zeroAddress;
	const tokenTo = to === zeroAddress ? nativeToken : to;
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
			// Caveat: slippage is only updated in the appData when a new quote is fetched
			appData: buildAppData(extra.slippage),
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
		tokenApprovalAddress: cowContractAddress,
		logo: 'https://assets.coingecko.com/coins/images/24384/small/cow.png?1660960589',
		isMEVSafe: true
	};
}

export async function swap({ chain, fromAddress, rawQuote, from, to }) {
	if (from === zeroAddress) {
		if (rawQuote.slippage < 2) {
			throw { reason: 'Slippage for ETH orders on CowSwap needs to be higher than 2%' };
		}

		const tx = await writeContract(config, {
			address: nativeSwapAddress[chain],
			abi: ABI.nativeSwap,
			functionName: 'createOrder',
			args: [
				{
					buyToken: to as `0x${string}`,
					receiver: fromAddress as `0x${string}`,
					sellAmount: BigInt(rawQuote.quote.sellAmount) + BigInt(rawQuote.quote.feeAmount),
					buyAmount: BigInt(rawQuote.quote.buyAmount),
					appData: rawQuote.quote.appDataHash,
					feeAmount: 0n,
					validTo: rawQuote.quote.validTo,
					partiallyFillable: rawQuote.quote.partiallyFillable,
					quoteId: rawQuote.id
				}
			],
			value: BigInt(rawQuote.quote.sellAmount) + BigInt(rawQuote.quote.feeAmount)
		});

		return tx;
	} else {
		// https://docs.cow.fi/cow-protocol/reference/core/signing-schemes#javascript-example
		const order = {
			sellToken: rawQuote.quote.sellToken as `0x${string}`,
			buyToken: rawQuote.quote.buyToken as `0x${string}`,
			receiver: fromAddress as `0x${string}`,
			sellAmount: BigInt(rawQuote.quote.sellAmount) + BigInt(rawQuote.quote.feeAmount),
			buyAmount: BigInt(rawQuote.quote.buyAmount),
			validTo: rawQuote.quote.validTo as number,
			appData: rawQuote.quote.appDataHash,
			feeAmount: 0n,
			kind: rawQuote.quote.kind as string,
			partiallyFillable: rawQuote.quote.partiallyFillable as boolean,
			sellTokenBalance: 'erc20',
			buyTokenBalance: 'erc20'
		};

		const signature = await signTypedData(config, {
			primaryType: 'Order',
			message: order,
			domain: {
				name: 'Gnosis Protocol',
				version: 'v2',
				chainId: chainsMap[chain],
				verifyingContract: '0x9008D19f58AAbD9eD0D60971565AA8510560ab41'
			},
			types: {
				Order: [
					{ name: 'sellToken', type: 'address' },
					{ name: 'buyToken', type: 'address' },
					{ name: 'receiver', type: 'address' },
					{ name: 'sellAmount', type: 'uint256' },
					{ name: 'buyAmount', type: 'uint256' },
					{ name: 'validTo', type: 'uint32' },
					{ name: 'appData', type: 'bytes32' },
					{ name: 'feeAmount', type: 'uint256' },
					{ name: 'kind', type: 'string' },
					{ name: 'partiallyFillable', type: 'bool' },
					{ name: 'sellTokenBalance', type: 'string' },
					{ name: 'buyTokenBalance', type: 'string' }
				]
			}
		});

		const data = await fetch(`${chainToId[chain]}/api/v1/orders`, {
			method: 'POST',
			body: JSON.stringify({
				...rawQuote.quote,
				sellAmount: String(order.sellAmount),
				feeAmount: '0',
				signature,
				signingScheme: 'eip712'
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		}).then((r) => r.json());

		if (data.errorType) throw { reason: data.description };

		return { id: data, waitForOrder: waitForOrder({ uid: data, trader: fromAddress, chain }) };
	}
}

export const getTxData = () => '';

export const getTx = () => ({});
