import { useQueries } from '@tanstack/react-query';
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

		return [
			toToken.label,
			data.map((route) => (route.status === 'fulfilled' ? route.value : null)).filter((route) => !!route)
		];
	} catch (error) {
		console.log(error);

		return [toToken.label, []];
	}
}

async function getAdapterRoutesByAmount({ chain, fromToken, toToken, amount, slippage, gasPriceData }) {
	try {
		const amountWithDecimals = BigNumber(amount)
			.times(10 ** (fromToken?.decimals || 18))
			.toFixed(0);

		const data = await Promise.allSettled(
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

		return [
			`${amount.toString()}+${slippage.toString()}`,
			data.map((route) => (route.status === 'fulfilled' ? route.value : null)).filter((route) => !!route)
		];
	} catch (error) {
		console.log(error);

		return [`${amount.toString()}+${slippage.toString()}`, []];
	}
}

export const useGetTokenLiquidity = ({
	chain,
	fromToken,
	topTokensOfChain
}: {
	chain: string | null;
	fromToken: IToken | null;
	topTokensOfChain: Array<IToken>;
}) => {
	const res = useQueries({
		queries: topTokensOfChain.map((toToken) => {
			return {
				queryKey: ['tokenLiquidity', chain, fromToken, toToken],
				queryFn: () =>
					getAdapterRoutesByLiquidity({
						chain: chain,
						fromToken,
						toToken
					})
			};
		})
	});

	return {
		isLoading: res.filter((r) => r.status === 'success').length >= 1 ? false : true,
		data: res.map((item) => (item.status === 'success' ? item.data : null)).filter((item) => !!item)
	};
};
