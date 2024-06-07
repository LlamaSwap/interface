import { useQuery } from '@tanstack/react-query';
import { chainGasToken, llamaToGeckoChainsMap } from '~/components/Aggregator/constants';
import { providers } from '~/components/Aggregator/rpcs';
import { ethers } from 'ethers';

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
		const cgPrices = await Promise.allSettled([
			fetchTimeout(
				`https://api.coingecko.com/api/v3/simple/price?ids=${chainGasToken[rawChain]}&vs_currencies=usd`,
				600
			).then((res) => res.json()),
			fetchTimeout(
				`https://api.coingecko.com/api/v3/simple/token_price/${llamaToGeckoChainsMap[rawChain]}?contract_addresses=${fromToken}%2C${toToken}&vs_currencies=usd`,
				600
			).then((res) => res.json())
		]);

		if (cgPrices[0].status === 'fulfilled') {
			gasTokenPrice = cgPrices[0].value?.[chainGasToken[rawChain]]?.['usd'];

			fromTokenPrice = fromToken === ZERO_ADDRESS ? gasTokenPrice : undefined;
			toTokenPrice = toToken === ZERO_ADDRESS ? gasTokenPrice : undefined;
		}

		if (cgPrices[1].status === 'fulfilled') {
			fromTokenPrice = fromTokenPrice || cgPrices[1].value[fromToken]?.['usd'];
			toTokenPrice = toTokenPrice || cgPrices[1].value[toToken]?.['usd'];
		}

		let llamaApi = [];
		const llamaChain = convertChain(rawChain);

		if (!gasTokenPrice) {
			llamaApi.push(`${llamaChain}:${ZERO_ADDRESS}`);
		}

		if (!fromTokenPrice) {
			llamaApi.push(`${llamaChain}:${fromToken}`);
		}

		if (!toTokenPrice) {
			llamaApi.push(`${llamaChain}:${toToken}`);
		}

		if (llamaApi.length > 0) {
			const { coins } = await fetch(`https://coins.llama.fi/prices/current/${llamaApi.join(',')}`).then((r) =>
				r.json()
			);

			gasTokenPrice = gasTokenPrice || coins[`${llamaChain}:${ZERO_ADDRESS}`]?.price;
			[fromTokenPrice, toTokenPrice] = await Promise.all([
				fromTokenPrice || coins[`${llamaChain}:${fromToken}`]?.price || getExperimentalPrice(rawChain, fromToken),
				toTokenPrice || coins[`${llamaChain}:${toToken}`]?.price || getExperimentalPrice(rawChain, toToken)
			]);
		}

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
		const experimentalPrices = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${token}`).then((res) =>
			res.json()
		);

		let weightedPrice = 0;
		let totalLiquidity = 0;

		experimentalPrices.pairs.forEach((pair: DexScreenerTokenPair) => {
			const { priceUsd, liquidity, chainId, baseToken } = pair;
			if (baseToken.address === ethers.utils.getAddress(token) && liquidity.usd > 10000 && chainId === chain) {
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
	return useQuery<IPrice>(['gasPrice', chain, fromToken, toToken], () => getPrice({ chain, fromToken, toToken }), {
		...(skipRefetch
			? {
					staleTime: 5 * 60 * 1000
			  }
			: { refetchInterval: 20_000 })
	});
}
