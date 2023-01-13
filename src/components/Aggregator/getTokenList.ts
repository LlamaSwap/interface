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

const fixTotkens = (tokenlist) => {
	// OKX token logo
	tokenlist[66][0].logoURI = tokenlist[66][1].logoURI;
	// BTC -> BTC.b
	tokenlist[43114].find(
		({ address }) => address.toLowerCase() === '0x152b9d0fdc40c096757f570a51e494bd4b943e50'
	).symbol = 'BTC.b';
	//RSR address
	tokenlist[1].find(({ address }) => address.toLowerCase() === '0x8762db106b2c2a0bccb3a80d1ed41273552616e8').address =
		'0x320623b8e4ff03373931769a31fc52a4e78b5d70';
	// XDAI -> DAI
	tokenlist[1].find(({ address }) => address.toLowerCase() === '0x6b175474e89094c44da98b954eedeac495271d0f').symbol =
		'DAI';

	return tokenlist;
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
	// const lifiList = await fetch('https://li.quest/v1/tokens').then((r) => r.json());

	const [uniList, sushiList, lifiList, geckoList] = await Promise.all([
		fetch('https://tokens.uniswap.org/').then((r) => r.json()),
		fetch('https://token-list.sushi.com/').then((r) => r.json()),
		fetch('https://li.quest/v1/tokens').then((r) => r.json()),
		fetch('https://api.coingecko.com/api/v3/coins/list?include_platform=false').then((res) => res.json())
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

	let tokenlist = {};

	for (const chain in tokensFiltered) {
		tokenlist[chain] = tokensFiltered[chain]
			.map((t) => ({
				...t,
				label: t.symbol,
				value: t.address,
				geckoId:
					geckoList && geckoList.length > 0
						? geckoList.find((geckoCoin) => geckoCoin.symbol === t.symbol?.toLowerCase())?.id ?? null
						: null
			}))
			.filter((t) => typeof t.address === 'string');
	}

	tokenlist = fixTotkens(tokenlist);

	return {
		props: {
			tokenlist
		},
		revalidate: 5 * 60 // 5 minutes
	};
}
