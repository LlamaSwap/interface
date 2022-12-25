import { groupBy, mapValues, merge, uniqBy } from 'lodash';
import { IToken } from '~/types';
import { nativeTokens } from './nativeTokens';

const tokensToRemove = {
	1: {
		['0xB8c77482e45F1F44dE1745F52C74426C631bDD52'.toLowerCase()]: true
	}
};

const oneInchChains = {
	ethereum: 1,
	bsc: 56,
	polygon: 137,
	optimism: 10,
	arbitrum: 42161,
	avax: 43114,
	gnosis: 100,
	fantom: 250,
	klaytn: 8217
};

export async function getTokenList() {
	// const uniList = await fetch('https://tokens.uniswap.org/').then((r) => r.json());
	// const sushiList = await fetch('https://token-list.sushi.com/').then((r) => r.json());
	const oneInch = await Promise.all(
		Object.values(oneInchChains).map(async (chainId) =>
			fetch(`https://tokens.1inch.io/v1.1/${chainId}`).then((r) => r.json())
		)
	);
	// const hecoList = await fetch('https://token-list.sushi.com/').then((r) => r.json()); // same as sushi

	const [uniList, sushiList, lifiList] = await Promise.all([
		await fetch('https://tokens.uniswap.org/').then((r) => r.json()),
		await fetch('https://token-list.sushi.com/').then((r) => r.json()),
		await fetch('https://li.quest/v1/tokens').then((r) => r.json())
	]);

	const oneInchList = Object.values(oneInchChains)
		.map((chainId, i) =>
			Object.values(oneInch[i]).map((token: { address: string }) => ({
				...token,
				chainId
			}))
		)
		.flat();

	const tokensByChain = mapValues(
		merge(
			groupBy([...oneInchList, ...sushiList.tokens, ...uniList.tokens, ...nativeTokens], 'chainId'),
			lifiList.tokens
		),
		(val) => uniqBy(val, (token: IToken) => token.address.toLowerCase())
	);

	const tokensFiltered = mapValues(tokensByChain, (val, key) => {
		return val.filter((token) => !tokensToRemove[key]?.[token.address.toLowerCase()]);
	});

	return {
		props: {
			tokenlist: tokensFiltered
		},
		revalidate: 5 * 60 // 5 minutes
	};
}
