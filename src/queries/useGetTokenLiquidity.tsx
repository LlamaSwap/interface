import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { liquidity, topTokens } from '~/components/Aggregator/constants';
import { adapters } from '~/components/Aggregator/router';
import { providers } from '~/components/Aggregator/rpcs';
import type { IToken } from '~/types';
import { getAdapterRoutes } from './useGetRoutes';

async function getAdapterRoutesByLiquidity({ chain, fromToken, toToken, gasPriceData }) {
	const data = await Promise.all(
		liquidity.map(({ amount, slippage }) =>
			getAdapterRoutesByAmount({
				chain,
				fromToken,
				toToken,
				amount,
				slippage,
				gasPriceData
			})
		)
	);

	return { [toToken.label]: data };
}

async function getAdapterRoutesByAmount({ chain, fromToken, toToken, amount, slippage, gasPriceData }) {
	const amountWithDecimals = BigNumber(amount)
		.times(10 ** (fromToken?.decimals || 18))
		.toFixed(0);

	const data = await Promise.all(
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

	return {
		[`${amount.toString()}+${slippage.toString()}`]: data
	};
}

const getTokenLiquidity = async ({
	chain,
	token,
	tokenList
}: {
	chain: string | null;
	token: string | null;
	tokenList: Array<IToken>;
}) => {
	try {
		if (!chain || !token || !tokenList) {
			return [];
		}

		let topTokensOfChain = [];
		let fromToken = null;

		for (let index = 0; index < tokenList.length; index++) {
			const value = tokenList[index];

			if (topTokens[chain].includes(value.symbol)) {
				topTokensOfChain.push({
					...value,
					value: value.address,
					label: value.symbol
				});
			}

			if (value.symbol.toLowerCase() === token) {
				fromToken = {
					...value,
					value: value.address,
					label: value.symbol
				};
			}
		}

		const gasPriceData = await providers[chain].getFeeData();

		const data = await Promise.all(
			topTokensOfChain.map((toToken) =>
				getAdapterRoutesByLiquidity({
					chain: chain,
					fromToken,
					toToken,
					gasPriceData
				})
			)
		);

		return data;
	} catch (error) {}
};

export const useGetTokenLiquidity = ({
	chain,
	token,
	tokenList
}: {
	chain: string | null;
	token: string | null;
	tokenList: Array<IToken>;
}) => {
	return useQuery(
		['tokenLiquidity', chain, token, tokenList ? true : false],
		() => getTokenLiquidity({ chain, token, tokenList }),
		{
			refetchInterval: 30_000
		}
	);
};
