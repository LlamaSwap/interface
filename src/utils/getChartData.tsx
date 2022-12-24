import BigNumber from 'bignumber.js';
import { initialLiquidity } from '~/components/Aggregator/constants';

export function getChartData({ routes, toTokenDecimals }) {
	// price at $500 liquidity
	const currentPrice = routes?.[0]?.[1]?.price?.amountReturned ?? null;

	const chartData = [];

	const newLiquidityValues = [];

	if (currentPrice) {
		routes?.forEach(([nofOfTokensToSwap, { price }], index) => {
			const amountReturned = price?.amountReturned ?? null;

			if (amountReturned) {
				const expectedPrice = Number(currentPrice) * (Number(nofOfTokensToSwap) / 500);

				const slippage = Number(Math.abs(((Number(amountReturned) - expectedPrice) / expectedPrice) * 100).toFixed(2));

				const prevValue = chartData[index - 1];

				if (chartData.length && prevValue && slippage - prevValue[1] > 1) {
					const newLiq = Math.round(Number(prevValue[0]) + Number(nofOfTokensToSwap) / 2);

					if (
						!newLiquidityValues.includes(newLiq) &&
						!initialLiquidity.includes(newLiq) &&
						newLiq > 500 &&
						newLiq < 500_000_000
					) {
						newLiquidityValues.push(newLiq);
					}
				}

				chartData.push([
					Number(nofOfTokensToSwap),
					slippage,
					BigNumber(amountReturned)
						.div(10 ** Number(toTokenDecimals || 18))
						.toFixed(3)
				]);
			}
		});
	}
	return { chartData, newLiquidityValues: newLiquidityValues.sort((a, b) => a - b) };
}
