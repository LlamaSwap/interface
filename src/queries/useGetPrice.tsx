import { useQuery } from '@tanstack/react-query';
import { llamaToGeckoChainsMap } from '~/components/Aggregator/constants';
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

function convertChain(chain: string) {
	if (chain === 'gnosis') return 'xdai';
	return chain;
}

async function getCoinsPrice({ chain: rawChain, fromToken, toToken }: IGetPriceProps) {
	let gasTokenPrice, fromTokenPrice, toTokenPrice;

	try {
		const cgPrices = await Promise.allSettled([
			fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${llamaToGeckoChainsMap[rawChain]}&vs_currencies=usd
	`).then((res) => res.json()),
			fetch(`https://api.coingecko.com/api/v3/simple/token_price/${llamaToGeckoChainsMap[rawChain]}?contract_addresses=${fromToken}%2C${toToken}&vs_currencies=usd
	`).then((res) => res.json())
		]);

		if (cgPrices[0].status === 'fulfilled') {
			gasTokenPrice = cgPrices[0].value[rawChain]?.['usd'];
		}

		if (cgPrices[1].status === 'fulfilled') {
			fromTokenPrice = cgPrices[1].value[fromToken]?.['usd'];
			toTokenPrice = cgPrices[1].value[toToken]?.['usd'];
		}

		let llamaApi = [];

		if (!gasTokenPrice) {
			llamaApi.push(`${rawChain}:${ZERO_ADDRESS}`);
		}

		if (!fromTokenPrice) {
			llamaApi.push(`${rawChain}:${fromToken}`);
		}

		if (!toTokenPrice) {
			llamaApi.push(`${rawChain}:${toToken}`);
		}

		if (llamaApi.length > 0) {
			const { coins } = await fetch(`https://coins.llama.fi/prices/current/${llamaApi.join(',')}`).then((r) =>
				r.json()
			);

			gasTokenPrice = gasTokenPrice || coins[`${rawChain}:${ZERO_ADDRESS}`]?.price;
			fromTokenPrice = fromTokenPrice || coins[`${rawChain}:${fromToken}`]?.price;
			toTokenPrice = toTokenPrice || coins[`${rawChain}:${toToken}`]?.price;
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
					refetchOnMount: false,
					refetchInterval: 5 * 60 * 1000, // 5 minutes
					refetchOnWindowFocus: false,
					refetchOnReconnect: false,
					refetchIntervalInBackground: false
			  }
			: { refetchInterval: 20_000 })
	});
}
