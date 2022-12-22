import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { liquidity } from '~/components/Aggregator/constants';
import { adapters } from '~/components/Aggregator/router';
import { providers } from '~/components/Aggregator/rpcs';
import type { IToken } from '~/types';
import { getAdapterRoutes } from './useGetRoutes';

async function getAdapterRoutesByLiquidity({ chain, fromToken, toToken }) {
	if (!fromToken || !chain || !toToken) {
		return [];
	}

	try {
		const gasPriceData = await providers[chain].getFeeData();

		const data = await Promise.allSettled(
			liquidity.map(({ amount, slippage }) =>
				getAdapterRoutesByAmount({
					chain,
					fromToken: { ...fromToken, value: fromToken.address, label: fromToken.symbol },
					toToken,
					amount,
					slippage,
					gasPriceData
				})
			)
		);

		return data.map((route) => (route.status === 'fulfilled' ? route.value : null)).filter((route) => !!route);
	} catch (error) {
		console.log(error);

		return [];
	}
}

async function getAdapterRoutesByAmount({ chain, fromToken, toToken, amount, slippage, gasPriceData }): Promise<
	[
		string,
		Array<{
			price?: { amountReturned: string; name: string; estimatedGas: string; feeAmount: string } | null;
			txData: any;
			name: any;
			airdrop: boolean;
			fromAmount: string;
		}>
	]
> {
	try {
		const amountWithDecimals = BigNumber(amount)
			.times(10 ** (fromToken?.decimals || 18))
			.toFixed(0);

		const res = await Promise.allSettled(
			adapters
				.filter((adap) => adap.chainToId[chain] !== undefined)
				.map((adapter) =>
					getAdapterRoutes({
						adapter,
						chain,
						from: fromToken?.value,
						to: toToken?.value,
						amount: amountWithDecimals,
						extra: {
							gasPriceData,
							amount: amount.toString(),
							fromToken,
							toToken,
							slippage: slippage.toString()
						}
					})
				)
		);

		const data = res.map((route) => (route.status === 'fulfilled' ? route.value : null)).filter((route) => !!route);

		return [`${amount.toString()}+${slippage.toString()}`, data];
	} catch (error) {
		console.log(error);

		return [`${amount.toString()}+${slippage.toString()}`, []];
	}
}

export const useGetTokenLiquidity = ({
	chain,
	fromToken,
	toToken
}: {
	chain: string | null;
	fromToken: IToken | null;
	toToken: IToken | null;
}) => {
	return useQuery([chain, fromToken?.address, toToken?.address], () =>
		getAdapterRoutesByLiquidity({
			chain: chain,
			fromToken,
			toToken
		})
	);
};
