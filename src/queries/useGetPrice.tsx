import { useQuery } from '@tanstack/react-query';
import { providers } from '~/components/Aggregator/rpcs';
import { getAddress, zeroAddress } from 'viem';

interface IGetPriceProps {
	chain?: string;
	fromToken?: string;
	toToken?: string;
	skipRefetch?: boolean;
}

interface IPrice {
	gasTokenPrice?: number;
	fromTokenPrice?: number;
	toTokenPrice?: number;
	gasPriceData?: {};
}

type DexScreenerTokenPair = {
	priceUsd: string;
	chainId: string;
	baseToken: {
		address: string;
	};
	liquidity: {
		usd: number;
	};
};

function convertChain(chain: string) {
	if (chain === 'gnosis') return 'xdai';
	if (chain === 'zksync') return 'era';
	return chain;
}

const fetchTimeout = (url, ms, options = {}) => {
	const controller = new AbortController();
	const promise = fetch(url, { signal: controller.signal, ...options });
	const timeout = setTimeout(() => controller.abort(), ms);
	return promise.finally(() => clearTimeout(timeout));
};

async function getCoinsPrice({ chain: rawChain, fromToken, toToken }: IGetPriceProps) {
	let gasTokenPrice, fromTokenPrice, toTokenPrice;

	try {
		const llamaChain = convertChain(rawChain!);
		let llamaApi = [`${llamaChain}:${zeroAddress}`, `${llamaChain}:${fromToken}`, `${llamaChain}:${toToken}`];

		const { coins } = await fetch(`https://coins.llama.fi/prices/current/${llamaApi.join(',')}`).then((r) => r.json());

		gasTokenPrice = gasTokenPrice || coins[`${llamaChain}:${zeroAddress}`]?.price;
		[fromTokenPrice, toTokenPrice] = await Promise.all([
			fromTokenPrice || coins[`${llamaChain}:${fromToken}`]?.price || getExperimentalPrice(rawChain!, fromToken!),
			toTokenPrice || coins[`${llamaChain}:${toToken}`]?.price || getExperimentalPrice(rawChain!, toToken!)
		]);

		return {
			gasTokenPrice,
			fromTokenPrice,
			toTokenPrice
		};
	} catch (error) {
		console.log(error);
		return {
			gasTokenPrice,
			fromTokenPrice,
			toTokenPrice
		};
	}
}

const getExperimentalPrice = async (chain: string, token: string): Promise<number | undefined> => {
	if (chain === 'gnosis') chain = 'gnosischain';
	try {
		const experimentalPrices = await fetchTimeout(`https://api.dexscreener.com/latest/dex/tokens/${token}`, 1.5e3).then(
			(res) => res.json()
		);

		let weightedPrice = 0;
		let totalLiquidity = 0;

		experimentalPrices.pairs.forEach((pair: DexScreenerTokenPair) => {
			const { priceUsd, liquidity, chainId, baseToken } = pair;
			if (baseToken.address === getAddress(token) && liquidity.usd > 10000 && chainId === chain) {
				if (totalLiquidity !== 0) {
					const avgPrice = weightedPrice / totalLiquidity;
					const priceDiff = Math.abs(Number(priceUsd) - avgPrice) / avgPrice;
					if (0.9 > priceDiff || priceDiff > 1.1) {
						throw new Error('Large price deviation');
					}
				}
				weightedPrice += Number(priceUsd) * liquidity.usd;
				totalLiquidity += liquidity.usd;
			}
		});

		return totalLiquidity > 0 ? weightedPrice / totalLiquidity : undefined;
	} catch (error) {
		console.log(error);
		return undefined;
	}
};

export async function getPrice({ chain: rawChain, fromToken, toToken }: IGetPriceProps) {
	try {
		if (!fromToken || !toToken || !rawChain) {
			return {};
		}
		const chain = convertChain(rawChain);

		const [{ gasTokenPrice, fromTokenPrice, toTokenPrice }, gasPriceData] = await Promise.all([
			getCoinsPrice({ chain: rawChain, fromToken, toToken }),
			providers[chain].getFeeData()
		]);

		return {
			gasTokenPrice,
			fromTokenPrice,
			toTokenPrice,
			gasPriceData
		};
	} catch (error) {
		console.log(error);
		return {};
	}
}

export function useGetPrice({ chain, fromToken, toToken, skipRefetch }: IGetPriceProps) {
	return useQuery<IPrice>({
		queryKey: ['gasPrice', chain, fromToken, toToken],
		queryFn: () => getPrice({ chain, fromToken, toToken }),
		...(skipRefetch
			? {
					staleTime: 5 * 60 * 1000
				}
			: { refetchInterval: 20_000 })
	});
}
