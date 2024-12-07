import { chunk } from 'lodash';
import { normalizeTokens } from '~/utils';
import { getTopTokensByChain } from './getTokenList';

const LIQUDITY_THRESHOLD_USD = 1_500_000;
const PERCENT_SANDWICHED_TRADES = 5;

export const getSandwichList = async () => {
	try {
		const { data: sandwichData } = await fetch(
			`https://public.api.eigenphi.io/?path=/ethereum/30d/sandwiched_pool&apikey=${process.env.EIGEN_API_KEY}`
		).then((res) => res.json());

		const [_, topTokens] = await getTopTokensByChain(1);

		const topPairs =
			topTokens
				?.filter((pair) => Number(pair?.attributes?.reserve_in_usd) > LIQUDITY_THRESHOLD_USD)
				.reduce(
					(acc, pair) => ({
						...acc,
						[(normalizeTokens(pair.token0?.address, pair?.token1?.address) as Array<string>).join('')]: true
					}),
					{}
				) ?? {};

		const poolAddresses = chunk(
			sandwichData?.map(({ address }) => address),
			30
		);
		const pairsData = (
			await Promise.allSettled(
				poolAddresses.map(
					async (pools) =>
						await fetch(`https://api.dexscreener.com/latest/dex/pairs/ethereum/${pools.join(',')}`).then((r) =>
							r.json()
						)
				)
			)
		)
			.filter(({ status }) => status === 'fulfilled')
			.map(({ value }: any) => value.pairs)
			.flat()
			.sort((a, b) => b.liquidity?.usd - a?.liquidity?.usd);

		const highLiqPairs = pairsData
			.filter((pair) => pair?.liquidity?.usd > LIQUDITY_THRESHOLD_USD)
			.map((pair) => ({
				...pair,
				id: (normalizeTokens(pair?.baseToken?.address, pair?.quoteToken?.address) as Array<string>).join('')
			}));

		const sandwichList = {
			ethereum: pairsData.reduce((acc, pair) => {
				const pairData = sandwichData.find(({ address }) => address.toLowerCase() === pair?.pairAddress?.toLowerCase());
				const pairId = (
					normalizeTokens(pairData?.tokens[0]?.address, pairData?.tokens[1]?.address) as Array<string>
				).join('');
				if (
					!pairData ||
					(pairData.sandwiched / pairData.trades) * 100 < PERCENT_SANDWICHED_TRADES ||
					topPairs[pairId] ||
					highLiqPairs.find(({ id }) => id === pairId)
				)
					return acc;

				return { ...acc, [pairId]: pairData };
			}, {})
		};

		return sandwichList;
	} catch (e) {
		console.log(e);
		return [];
	}
};
