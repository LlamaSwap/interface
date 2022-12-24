import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { initialLiquidity } from '~/components/Aggregator/constants';
import { adapters } from '~/components/Aggregator/router';
import { providers } from '~/components/Aggregator/rpcs';
import type { IToken } from '~/types';
import { getAdapterRoutes } from './useGetRoutes';
import { getPrice } from './useGetPrice';
import { getTopRoute } from '~/utils/getTopRoute';

async function getAdapterRoutesByLiquidity({ chain, fromToken, toToken }) {
	if (!fromToken || !chain || !toToken) {
		return [];
	}

	try {
		const [gasPriceData, { gasTokenPrice = 0, fromTokenPrice, toTokenPrice = 0 }] = await Promise.all([
			providers[chain].getFeeData(),
			getPrice({ chain, fromToken: fromToken.address, toToken: toToken.address })
		]);

		const res = await Promise.allSettled(
			initialLiquidity.map((amount) =>
				getAdapterRoutesByAmount({
					chain,
					fromToken: { ...fromToken, value: fromToken.address, label: fromToken.symbol },
					toToken,
					amount,
					fromTokenPrice,
					gasPriceData
				})
			)
		);

		const topRoutes = [];

		res.forEach((item) => {
			if (item.status === 'fulfilled') {
				const [liquidity, routes] = item.value;

				const topRoute = getTopRoute({ routes, gasPriceData, gasTokenPrice, fromToken, toToken, toTokenPrice });

				topRoutes.push([liquidity, topRoute]);
			}
		});

		return topRoutes;
	} catch (error) {
		console.log(error);

		return [];
	}
}

async function getAdapterRoutesByAmount({ chain, fromToken, toToken, amount, fromTokenPrice, gasPriceData }): Promise<
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
		const amountWithDecimals = BigNumber(BigNumber(amount).times(BigNumber(1).div(fromTokenPrice)))
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
							toToken
						}
					})
				)
		);

		const data = res.map((route) => (route.status === 'fulfilled' ? route.value : null)).filter((route) => !!route);

		return [`${amount.toString()}`, data];
	} catch (error) {
		console.log(error);

		return [`${amount.toString()}`, []];
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
	return useQuery(['initialLiquidity', chain, fromToken?.address, toToken?.address], () =>
		getAdapterRoutesByLiquidity({
			chain: chain,
			fromToken,
			toToken
		})
	);
};
