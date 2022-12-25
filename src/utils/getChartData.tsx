import BigNumber from 'bignumber.js';
import { initialLiquidity } from '~/components/Aggregator/constants';

export function getChartData({ routes, price, fromTokenDecimals, toTokenDecimals, minimumSlippage, maximumSlippage }) {
	const liquidityAt = price || 500;
	// price at $500 liquidity
	const currentPrice = routes?.find((route) => route[0] === liquidityAt)?.[1]?.price?.amountReturned ?? null;

	const chartData = [];

	const newLiquidityValues = [];

	if (currentPrice) {
		routes?.forEach(([netOutUSD, { name, price, fromAmount }], index) => {
			const amountReturned = price?.amountReturned ?? null;

			if (amountReturned) {
				const expectedPrice = Number(currentPrice) * (Number(netOutUSD) / liquidityAt);

				const slippage =
					netOutUSD < liquidityAt
						? 0
						: Number(Math.abs(((Number(amountReturned) - expectedPrice) / expectedPrice) * 100).toFixed(2));

				const prevValue = chartData[index - 1];

				if (chartData.length && prevValue && slippage - prevValue[1] > 1) {
					const newLiq = Math.floor((Number(prevValue[0]) + Number(netOutUSD)) / 2);

					if (
						!newLiquidityValues.includes(newLiq) &&
						!initialLiquidity.includes(newLiq) &&
						newLiq > 500 &&
						newLiq < 500_000_000 &&
						routes.length <= 100
					) {
						newLiquidityValues.push(newLiq);
					}
				}

				chartData.push([
					Number(netOutUSD),
					slippage,
					Number(
						BigNumber(amountReturned)
							.div(10 ** Number(toTokenDecimals || 18))
							.toFixed(3)
					),
					name,
					Number(
						BigNumber(fromAmount)
							.div(10 ** Number(fromTokenDecimals || 18))
							.toFixed(3)
					)
				]);
			}
		});
	}

	const minIndex = getMinIndexRoute(chartData, minimumSlippage || 0);
	const maxIndex = getMaxIndexRoute(chartData, maximumSlippage || 100);

	const dataInRange = chartData.slice(minIndex, maxIndex + 1);

	return {
		chartData: dataInRange.filter((values, index) =>
			dataInRange[index + 1] ? values[1] < dataInRange[index + 1][1] : true
		),
		newLiquidityValues: newLiquidityValues.sort((a, b) => a - b)
	};
}

function getMinIndexRoute(arr, minSlippage) {
	let left = 0,
		right = arr.length - 1;

	while (left <= right) {
		// Process until it is last element

		let mid = Math.floor((left + (right + 1)) / 2); // using floor as we may get floating numbers

		if (arr[mid][1] >= minSlippage && (mid > 0 ? arr[mid - 1][1] < minSlippage : true)) {
			// element found at mid
			return mid; // no need to process further
		}

		if (minSlippage < arr[mid][1]) {
			// element might be in first half
			right = mid - 1; // right is mid - 1 because we know that mid is not correct element
		} else {
			// element might be in second half
			left = mid + 1; // left is mid + 1 because we know that mid is not correct element
		}
	}

	return 0; // if not found, return 0 index
}

function getMaxIndexRoute(arr, maxSlippage) {
	let left = 0,
		right = arr.length - 1;

	while (left <= right) {
		// Process until it is last element

		let mid = Math.floor((left + (right + 1)) / 2); // using floor as we may get floating numbers

		if (arr[mid][1] <= maxSlippage && (mid < arr.length - 1 ? arr[mid + 1][1] > maxSlippage : true)) {
			// element found at mid
			return mid; // no need to process further
		}

		if (maxSlippage < arr[mid][1]) {
			// element might be in first half
			right = mid - 1; // right is mid - 1 because we know that mid is not correct element
		} else {
			// element might be in second half
			left = mid + 1; // left is mid + 1 because we know that mid is not correct element
		}
	}

	return arr.length; // if not found, return array length
}
