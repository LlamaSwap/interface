import { useQuery } from '@tanstack/react-query';
import { getAddress, zeroAddress } from 'viem';
import { getGasPrice } from 'wagmi/actions';
import { chainsMap } from '~/components/Aggregator/constants';
import { config } from '~/components/WalletProvider';

interface IGetPriceProps {
	chain?: string;
	fromToken?: string;
	toToken?: string;
	skipRefetch?: boolean;
}

interface IPrice {
	gasTokenPrice?: number | null;
	fromTokenPrice?: number | null;
	toTokenPrice?: number | null;
	gasPriceData?: { gasPrice: number } | null;
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

		const unixTsNow = Date.now()/1e3
		const outdatedCoins = Object.entries(coins).filter((c:any)=>c[1].timestamp < unixTsNow - 90)
		if(outdatedCoins.length > 0){
			const newCoins = await fetch(`https://coins.llama.fi/prices/update/${outdatedCoins.map(c=>c[0]).join(',')}`).then((r) => r.json());
			Object.assign(coins, newCoins.coins)
		}

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

		const [coinsPrice, gasPrice] = await Promise.allSettled([
			getCoinsPrice({ chain: rawChain, fromToken, toToken }),
			getGasPrice(config, { chainId: chainsMap[chain] })
		]);

		return {
			gasTokenPrice: coinsPrice.status === 'fulfilled' ? coinsPrice.value.gasTokenPrice : null,
			fromTokenPrice: coinsPrice.status === 'fulfilled' ? coinsPrice.value.fromTokenPrice : null,
			toTokenPrice: coinsPrice.status === 'fulfilled' ? coinsPrice.value.toTokenPrice : null,
			gasPriceData: gasPrice.status === 'fulfilled' ? { gasPrice: Number(gasPrice.value) } : null
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
			: { staleTime: 20_000, refetchInterval: 20_000 })
	});
}
