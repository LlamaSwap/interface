import { CurrencyAmount, Ether, Percent, Token, TradeType, ChainId } from '@uniswap/sdk-core';
import { AlphaRouter, SwapOptionsUniversalRouter, SwapType } from '@uniswap/smart-order-router';
import JSBI from 'jsbi';
import { AllowanceData, AllowanceProvider, AllowanceTransfer, PERMIT2_ADDRESS } from '@uniswap/Permit2-sdk';
import { ethers } from 'ethers';
import { providers } from '../../rpcs';
import { sendTx } from '../../utils/sendTx';
import { applyArbitrumFees } from '../../utils/arbitrumFees';
import BigNumber from 'bignumber.js';
import { altReferralAddress } from '../../constants';

export const chainToId = {
	ethereum: ChainId.MAINNET,
	arbitrum: ChainId.ARBITRUM_ONE,
	optimism: ChainId.OPTIMISM
};

export const name = 'Uniswap';
export const token = 'UNI';

export function fromReadableAmount(amount: string, decimals: number): JSBI {
	const value = ethers.utils.parseUnits(amount, decimals);

	return JSBI.BigInt(value);
}

export const uniToken = (address, decimals, chain) => {
	if (address === ethers.constants.AddressZero) return Ether.onChain(chainToId[chain]);
	return new Token(chainToId[chain], address, decimals);
};

export async function getQuote(chain: string, from: string, to: string, amount: string, extra) {
	const fromToken = uniToken(from, extra.fromToken.decimals, chain);
	const toToken = uniToken(to, extra.toToken.decimals, chain);

	const router = new AlphaRouter({
		chainId: chainToId[chain],
		provider: providers[chain]
	});

	const options: SwapOptionsUniversalRouter = {
		recipient: extra.userAddress,
		slippageTolerance: new Percent(+extra.slippage * 1000, 100000),
		type: SwapType.UNIVERSAL_ROUTER
	};

	const route = await router.route(
		CurrencyAmount.fromRawAmount(fromToken, fromReadableAmount(extra.amount, extra.fromToken.decimals).toString()),
		toToken,
		TradeType.EXACT_INPUT,
		options
	);

	const routerAddress = route.methodParameters.to;

	const signPermitAndSwap = async (provider: ethers.Wallet) => {
		const allowanceProvider = new AllowanceProvider(providers[chain], PERMIT2_ADDRESS);
		const allowance: AllowanceData = await allowanceProvider?.getAllowanceData(from, extra.userAddress, routerAddress);
		const deadline = (new Date().getTime() / 1000 + 300).toFixed(0);
		const permitDetails = {
			nonce: allowance.nonce,
			token: from,
			amount,
			expiration: deadline
		};
		const { domain, types, values } = AllowanceTransfer.getPermitData(
			{
				spender: routerAddress,
				sigDeadline: deadline,
				details: permitDetails
			},
			PERMIT2_ADDRESS,
			chainToId[chain]
		);
		const signature = await provider._signTypedData(domain, types, values);
		const permit = {
			signature,
			details: permitDetails,
			sigDeadline: deadline,
			spender: routerAddress
		};
		const route = await router.route(
			CurrencyAmount.fromRawAmount(fromToken, fromReadableAmount(extra.amount, extra.fromToken.decimals).toString()),
			toToken,
			TradeType.EXACT_INPUT,
			{
				...options,
				inputTokenPermit: permit,
				fee: { fee: new Percent(15, 1000), recipient: altReferralAddress }
			}
		);

		const rawQuote = {
			tx: {
				data: route.methodParameters.calldata,
				value: route.methodParameters.value,
				to: routerAddress
			},
			gasLimit: gas
		};
		const res = await swap({ chain, signer: provider, rawQuote });

		return res;
	};
	let gas = route.estimatedGasUsed.toString();
	if (chain === 'arbitrum')
		gas = route === null ? null : await applyArbitrumFees(routerAddress, route.methodParameters.calldata, gas);
	if (chain === 'optimism') gas = BigNumber(7).times(gas).toFixed(0, 1);
	return {
		amountReturned: +route.trade.outputAmount.toExact() * 10 ** extra.toToken.decimals,
		estimatedGas: gas,
		signPermitAndSwap: from === ethers.constants.AddressZero ? null : signPermitAndSwap,
		tokenApprovalAddress: PERMIT2_ADDRESS,
		rawQuote: {
			tx: {
				data: route.methodParameters.calldata,
				value: route.methodParameters.value,
				to: routerAddress
			},
			gasLimit: gas
		}
	};
}

export async function swap({ chain, signer, rawQuote }) {
	const fromAddress = await signer.getAddress();

	const tx = await sendTx(signer, chain, {
		from: fromAddress,
		...rawQuote.tx,
		...(chain === 'optimism' && { gasLimit: rawQuote.gasLimit })
	});

	return tx;
}

export const getTxData = ({ rawQuote }) => rawQuote?.tx?.data;

export const getTx = ({ rawQuote }) => ({
	to: rawQuote?.tx?.to,
	data: rawQuote?.tx?.data,
	value: rawQuote?.tx?.value
});
