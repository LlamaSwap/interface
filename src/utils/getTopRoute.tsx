import { ethers } from 'ethers';

export function getTopRoute({ routes, gasPriceData, gasTokenPrice, fromToken, toToken, toTokenPrice }) {
	const sortedRoutes = routes
		.map((route) => {
			if (route.price) {
				let gasUsd =
					route.price?.estimatedGas && gasPriceData?.formatted?.gasPrice && gasTokenPrice
						? (gasTokenPrice * +route.price?.estimatedGas * +gasPriceData?.formatted?.gasPrice) / 1e18
						: 0;

				// CowSwap native token swap
				gasUsd =
					route.price.feeAmount && fromToken.address === ethers.constants.AddressZero
						? (Number(route.price.feeAmount) / 1e18) * gasTokenPrice
						: gasUsd;
				const amount = +route.price.amountReturned / 10 ** +toToken?.decimals;
				const amountUsd = (amount * toTokenPrice).toFixed(2);
				const netOut = +amountUsd - gasUsd;

				return { ...route, netOut };
			}
			return { ...route, netOut: 0 };
		})
		.sort((a, b) => Number(b.netOut ?? 0) - Number(a.netOut ?? 0));

	const topRoute = sortedRoutes.length > 0 ? sortedRoutes[0] : null;

	return topRoute;
}
