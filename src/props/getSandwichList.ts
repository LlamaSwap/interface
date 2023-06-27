import { chunk } from 'lodash';
import { dexToolsChainMap } from '~/components/Aggregator/constants';
import { normalizeTokens } from '~/utils';

const LIQUDITY_THRESHOLD_USD = 1_500_000;
const PERCENT_SANDWICHED_TRADES = 5;

export const getSandwichList = async () => {
	try {
		const { data: sandwichData } = await fetch(
			`https://public.api.eigenphi.io/?path=/ethereum/30d/sandwiched_pool&apikey=${process.env.EIGEN_API_KEY}`
		).then((res) => res.json());

		const { data: top100Pairs = [] } = await fetch(
			`https://www.dextools.io/shared/analytics/pairs?limit=100&interval=24h&chain=${dexToolsChainMap[1]}`
		).then((res) => res.json());

		const topPairs =
			top100Pairs
				?.filter((pair) => pair.pair.metrics.liquidity > LIQUDITY_THRESHOLD_USD)
				.reduce(
					(acc, pair) => ({
						...acc,
						[normalizeTokens(pair._id.token, pair._id.tokenRef).join('')]: true
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
			.map((pair) => ({ ...pair, id: normalizeTokens(pair?.baseToken?.address, pair?.quoteToken?.address).join('') }));

		const sandwichList = {
			ethereum: pairsData.reduce((acc, pair) => {
				const pairData = sandwichData.find(({ address }) => address.toLowerCase() === pair?.pairAddress?.toLowerCase());
				const pairId = normalizeTokens(pairData?.tokens[0]?.address, pairData?.tokens[1]?.address).join('');
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
