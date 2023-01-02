import { useQueries, useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { initialLiquidity } from '~/components/Aggregator/constants';
import { adapters } from '~/components/Aggregator/router';
import type { IToken } from '~/types';
import { getAdapterRoutes } from './useGetRoutes';
import { getTopRoute } from '~/utils/getTopRoute';
import { useMemo } from 'react';
import { ethers } from 'ethers';

async function getInitialLiquidityRoutes({
	chain,
	fromToken,
	toToken,
	gasPriceData,
	fromTokenPrice,
	toTokenPrice,
	gasTokenPrice
}) {
	if (!fromToken || !chain || !toToken || !gasPriceData || !fromTokenPrice || !toTokenPrice || !gasTokenPrice) {
		return [];
	}

	try {
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

				topRoutes.push([Number(liquidity), topRoute]);
			}
		});

		return topRoutes;
	} catch (error) {
		console.log(error);

		return [];
	}
}

async function getLiquidityRoutes({
	chain,
	fromToken,
	toToken,
	gasPriceData,
	fromTokenPrice,
	toTokenPrice,
	gasTokenPrice,
	amount
}) {
	try {
		if (
			!fromToken ||
			!chain ||
			!toToken ||
			!gasPriceData ||
			!fromTokenPrice ||
			!toTokenPrice ||
			!gasTokenPrice ||
			!amount
		) {
			return [amount, null];
		}

		const [, routes] = await getAdapterRoutesByAmount({
			chain,
			fromToken: { ...fromToken, value: fromToken.address, label: fromToken.symbol },
			toToken,
			amount,
			fromTokenPrice,
			gasPriceData
		});

		const topRoute = getTopRoute({ routes, gasPriceData, gasTokenPrice, fromToken, toToken, toTokenPrice });

		return [amount, topRoute];
	} catch (error) {
		console.log(error);
		return [amount, null];
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
				.filter((adap) => adap.chainToId[chain])
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
							userAddress: ethers.constants.AddressZero
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

interface IGetInitialTokenLiquidity {
	chain: string | null;
	fromToken: IToken | null;
	toToken: IToken | null;
	gasPriceData?: {};
	gasTokenPrice?: number | null;
	fromTokenPrice?: number | null;
	toTokenPrice?: number | null;
}

export const useGetInitialTokenLiquidity = ({
	chain,
	fromToken,
	toToken,
	gasTokenPrice,
	fromTokenPrice,
	toTokenPrice,
	gasPriceData
}: IGetInitialTokenLiquidity) => {
	return useQuery(
		['initialLiquidity', chain, fromToken?.address, toToken?.address, gasTokenPrice, fromTokenPrice, toTokenPrice],
		() =>
			getInitialLiquidityRoutes({
				chain: chain,
				fromToken,
				toToken,
				gasTokenPrice,
				fromTokenPrice,
				toTokenPrice,
				gasPriceData
			}),
		{
			refetchOnMount: false,
			refetchInterval: 5 * 60 * 1000, // 5 minutes
			refetchOnWindowFocus: false,
			refetchOnReconnect: false,
			refetchIntervalInBackground: false
		}
	);
};

interface ITokensLiquidity extends IGetInitialTokenLiquidity {
	liquidity: Array<number>;
}

export const useGetTokensLiquidity = ({
	chain,
	fromToken,
	toToken,
	gasTokenPrice,
	fromTokenPrice,
	toTokenPrice,
	gasPriceData,
	liquidity
}: ITokensLiquidity) => {
	const res = useQueries({
		queries: liquidity.map((liquidityAmount) => {
			return {
				queryKey: [
					'liquidity',
					liquidityAmount,
					chain,
					fromToken?.address,
					toToken?.address,
					gasTokenPrice,
					fromTokenPrice,
					toTokenPrice
				],
				queryFn: () =>
					getLiquidityRoutes({
						chain: chain,
						fromToken,
						toToken,
						gasTokenPrice,
						fromTokenPrice,
						toTokenPrice,
						gasPriceData,
						amount: liquidityAmount
					}),
				refetchOnMount: false,
				refetchInterval: 5 * 60 * 1000, // 5 minutes
				refetchOnWindowFocus: false,
				refetchOnReconnect: false,
				refetchIntervalInBackground: false,
				retry: 0,
				retryOnMount: false
			};
		})
	});

	return {
		isLoading: res.filter((r) => r.status === 'success').length >= 1 ? false : true,
		data: useMemo(() => res?.filter((r) => r.status === 'success').map((r) => r.data) ?? [], [res])
	};
};
