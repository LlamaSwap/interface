import { getTokenList } from '~/components/Aggregator';
import { chainsMap, liquidity, topTokens } from '~/components/Aggregator/constants';
import { adapters } from '~/components/Aggregator/router';
import { getAdapterRoutes } from '~/queries/useGetRoutes';
import BigNumber from 'bignumber.js';
import { providers } from '~/components/Aggregator/rpcs';

export default async function TokenLiquidity(req, res) {
	const { chain, token } = req.query;

	const chainName = typeof chain === 'string' ? chain.toLowerCase() : null;
	const fromTokenSymbol = typeof token === 'string' ? token.toLowerCase() : null;

	const {
		props: { tokenlist }
	} = await getTokenList();

	const chainTokenList = tokenlist ? tokenlist[chainsMap[chain]] : null;

	if (!chainName || !fromTokenSymbol || !chainTokenList) {
		res.status(404).send('Not found');
	} else {
		let topTokensOfChain = [];
		let fromToken = null;

		for (let index = 0; index < chainTokenList.length; index++) {
			const value = chainTokenList[index];

			if (topTokens[chain].includes(value.symbol)) {
				topTokensOfChain.push({
					...value,
					value: value.address,
					label: value.symbol
				});
			}

			if (value.symbol.toLowerCase() === fromTokenSymbol) {
				fromToken = {
					...value,
					value: value.address,
					label: value.symbol
				};
			}
		}

		const gasPriceData = await providers[chainName].getFeeData();

		const data = await Promise.all(
			topTokensOfChain.map((toToken) =>
				getAdapterRoutesByLiquidity({
					chain: chainName,
					fromToken,
					toToken,
					gasPriceData
				})
			)
		);

		res.status(200).json({ data });
	}

	return res;
}

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
