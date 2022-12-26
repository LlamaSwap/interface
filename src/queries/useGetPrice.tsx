import { useQuery } from '@tanstack/react-query';
import { providers } from '~/components/Aggregator/rpcs';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

interface IGetPriceProps {
	chain: string;
	fromToken: string;
	toToken: string;
	skipRefetch?: boolean;
}

interface IPrice {
	gasTokenPrice?: number;
	fromTokenPrice?: number;
	toTokenPrice?: number;
	gasPriceData?: {};
}

export async function getPrice({ chain, fromToken, toToken }: IGetPriceProps) {
	if (!fromToken || !toToken || !chain) {
		return { gasTokenPrice: 0, fromTokenPrice: 0, toTokenPrice: 0 };
	}
	const [{ coins }, gasPriceData] = await Promise.all([
		fetch(
			`https://coins.llama.fi/prices/current/${chain}:${toToken},${chain}:${ZERO_ADDRESS},${chain}:${fromToken}`
		).then((r) => r.json()),
		providers[chain].getFeeData()
	]);

	return {
		gasTokenPrice: coins[`${chain}:${ZERO_ADDRESS}`]?.price,
		fromTokenPrice: coins[`${chain}:${fromToken}`]?.price,
		toTokenPrice: coins[`${chain}:${toToken}`]?.price,
		gasPriceData
	};
}

export function useGetPrice({ chain, fromToken, toToken, skipRefetch }: IGetPriceProps) {
	return useQuery<IPrice>(['gasPrice', chain, fromToken, toToken], () => getPrice({ chain, fromToken, toToken }), {
		...(skipRefetch
			? {
					refetchOnMount: false,
					refetchInterval: 5 * 60 * 1000, // 5 minutes
					refetchOnWindowFocus: false,
					refetchOnReconnect: false,
					refetchIntervalInBackground: false
			  }
			: { refetchInterval: 20_000 })
	});
}
