import { useQuery } from '@tanstack/react-query';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

interface IGetPriceProps {
	chain: string;
	fromToken: string;
	toToken: string;
}

interface IPrice {
	gasTokenPrice?: number;
	fromTokenPrice?: number;
	toTokenPrice?: number;
}

async function getPrice({ chain, fromToken, toToken }: IGetPriceProps) {
	if (!fromToken && !toToken) {
		return { gasTokenPrice: 0, fromTokenPrice: 0, toTokenPrice: 0 };
	}
	const { coins } = await fetch(
		`https://coins.llama.fi/prices/current/${chain}:${toToken},${chain}:${ZERO_ADDRESS},${chain}:${fromToken}`
	).then((r) => r.json());

	return {
		gasTokenPrice: coins[`${chain}:${ZERO_ADDRESS}`]?.price,
		fromTokenPrice: coins[`${chain}:${fromToken}`]?.price,
		toTokenPrice: coins[`${chain}:${toToken}`]?.price
	};
}

export default function useGetPrice({ chain, fromToken, toToken }: IGetPriceProps) {
	return useQuery<IPrice>(['gasPrice', chain, fromToken, toToken], () => getPrice({ chain, fromToken, toToken }), {
		refetchInterval: 20_000
	});
}
