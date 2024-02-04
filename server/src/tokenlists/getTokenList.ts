import { groupBy, mapValues, uniqBy } from 'lodash';
import { ethers } from 'ethers';
import { nativeTokens } from './nativeTokens';
import { geckoChainsMap, geckoTerminalChainsMap } from './constants';
import { ownTokenList } from './ownTokenlist';
import multichainListRaw from './multichain/250.json';
import { getTokensData } from './getTokensData';
import type { IToken } from './types';

const tokensToRemove = {
	1: {
		['0xB8c77482e45F1F44dE1745F52C74426C631bDD52'.toLowerCase()]: true
	}
};

const FANTOM_ID = 250;

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
	// tokenlist[1].find(({ address }) => address.toLowerCase() === '0x8762db106b2c2a0bccb3a80d1ed41273552616e8').address =
	// 	'0x320623b8e4ff03373931769a31fc52a4e78b5d70';
	// XDAI -> DAI
	tokenlist[1].find(({ address }) => address.toLowerCase() === '0x6b175474e89094c44da98b954eedeac495271d0f').symbol =
		'DAI';

	return tokenlist;
};

const markMultichain = (tokens) => {
	const multichainList = Object.values(multichainListRaw);

	tokens[FANTOM_ID] = tokens[FANTOM_ID].map((token) => {
		const isMultichain = !!multichainList.find(
			(multitoken: any) => multitoken.address?.toLowerCase() === token.address.toLowerCase()
		);

		return {
			...token,
			isMultichain
		};
	});
	Object.values(tokens).map((tokensOnChain: any[]) =>
		tokensOnChain.map((token) => {
			if (token.symbol.startsWith('any')) {
				token.isMultichain = true;
			}
		})
	);

	return tokens;
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
	const [sushiList, geckoList, logos, ownList, zksyncList, quickSwapList, lineaList] = await Promise.all([
		fetch('https://tokens.sushi.com/v0')
			.then((r) => r.json())
			.then((r) =>
				r.map((token) => ({
					...token,
					logoURI: `https://cdn.sushi.com/image/upload/f_auto,c_limit,w_40,q_auto/tokens/${token.chainId}/${token.address}.jpg`
				}))
			),
		fetch('https://defillama-datasets.llama.fi/tokenlist/all.json').then((res) => res.json()),
		fetch('https://defillama-datasets.llama.fi/tokenlist/logos.json').then((res) => res.json()),
		fetch('https://raw.githubusercontent.com/0xngmi/tokenlists/master/canto.json')
			.then((res) => res.json())
			.then((r) => r.filter((t) => t.chainId === 7700)),
		fetch('https://raw.githubusercontent.com/muteio/token-directory/main/zksync.json')
			.then((res) => res.json())
			.then((r) => r.filter((t) => t.chainId === 324)),
		fetch('https://unpkg.com/quickswap-default-token-list@latest/build/quickswap-default.tokenlist.json')
			.then((res) => res.json())
			.then((r) => r.tokens.filter((t) => t.chainId === 1101)),
		fetch('https://ks-setting.kyberswap.com/api/v1/tokens?page=1&pageSize=100&isWhitelisted=true&chainIds=59144')
			.then((r) => r.json())
			.then((r) => r?.data?.tokens.filter((t) => t.chainId === 59144))
			.catch((e) => [])
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
		groupBy(
			[
				...nativeTokens,
				...ownTokenList,
				...oneInchList,
				...sushiList,
				...zksyncList,
				...quickSwapList,
				...ownList,
				...lineaList
			].filter((t) => t.address !== '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'),
			'chainId'
		),
		(val) => uniqBy(val, (token: IToken) => token.address.toLowerCase())
	);

	let tokensFiltered = mapValues(tokensByChain, (val, key) => {
		return val
			.filter((token) => typeof token.address === 'string' && !tokensToRemove[key]?.[token.address.toLowerCase()])
			.map((token) => ({ ...token, address: token.address.toLowerCase() }));
	});

	tokensFiltered = fixTotkens(tokensFiltered);

	tokensFiltered = markMultichain(tokensFiltered);

	// get top tokens on each chain
	const topTokensByChain = await Promise.all(Object.keys(tokensFiltered).map((chain) => getTopTokensByChain(chain)));

	const topTokensByVolume = Object.fromEntries(
		topTokensByChain.filter((chain) => chain !== null && tokensFiltered[chain[0]])
	);

	// store unique tokens by chain
	const uniqueTokenList = {};

	for (const chain in tokensFiltered) {
		tokensFiltered[chain].forEach((token) => {
			if (!uniqueTokenList[chain]) {
				uniqueTokenList[chain] = new Set();
			}

			uniqueTokenList[chain].add(token.address);
		});
	}

	// store coingecko tokens that aren't in above token list by chain
	const geckoListByChain = {};

	if (geckoList && geckoList.length > 0) {
		geckoList.forEach((geckoToken) => {
			Object.entries(geckoToken.platforms || {}).forEach(([chain, address]: [string, string]) => {
				const id = geckoChainsMap[chain];

				if (id && !uniqueTokenList[String(id)]?.has(address.toLowerCase())) {
					if (!geckoListByChain[id]) {
						geckoListByChain[id] = new Set();
					}

					geckoListByChain[id].add(address.toLowerCase());
				}
			});
		});
	}

	// fetch name, symbol, decimals fo coingecko tokens
	const geckoTokensList = await Promise.all(
		Object.entries(geckoListByChain).map(([chain, tokens]: [string, Set<string>]) =>
			getTokensData([chain, Array.from(tokens || new Set())])
		)
	);

	const formatAndSortTokens = (tokens, chain) => {
		return tokens
			.map((t) => {
				const geckoId =
					geckoList && geckoList.length > 0
						? geckoList.find((geckoCoin) => geckoCoin.symbol === t.symbol?.toLowerCase())?.id ?? null
						: null;

				const token = Array.isArray(topTokensByVolume?.[chain])
					? topTokensByVolume[chain]?.find((item) => item?.token0?.address?.toLowerCase() === t.address?.toLowerCase())
					: null;

				const volume24h =
					Number(token?.attributes?.from_volume_in_usd ?? 0) + Number(token?.attributes?.to_volume_in_usd ?? 0);

				return {
					...t,
					label: t.symbol,
					value: t.address,
					geckoId,
					logoURI: t.ownLogoURI || `https://token-icons.llamao.fi/icons/tokens/${t.chainId}/${t.address}?h=20&w=20`,
					logoURI2: t.logoURI || logos[geckoId] || null,
					volume24h
				};
			})
			.sort((a, b) => (b.address === ethers.constants.AddressZero ? 1 : b.volume24h - a.volume24h));
	};

	// store coingecko token lists by chain
	const cgList = {};
	geckoTokensList.forEach((data) => {
		const [chain, tokens] = data;

		if (!cgList[chain]) {
			cgList[chain] = [];
		}

		cgList[chain] = formatAndSortTokens(tokens || [], chain);
	});

	// format and store final tokens list
	let tokenlist = {};
	for (const chain in tokensFiltered) {
		tokenlist[chain] = [...formatAndSortTokens(tokensFiltered[chain] || [], chain), ...(cgList[chain] || [])];
	}

	return tokenlist;
}

export const getTopTokensByChain = async (chainId) => {
	try {
		if (!geckoTerminalChainsMap[chainId]) {
			return [chainId, []];
		}

		const resData = [];
		const resIncluded = [];

		let prevRes = await fetch(
			`https://app.geckoterminal.com/api/p1/${geckoTerminalChainsMap[chainId]}/pools?include=dex%2Cdex.network%2Cdex.network.network_metric%2Ctokens&page=1&include_network_metrics=true`
		).then((res) => res.json());

		for (let i = 0; i < 5; i++) {
			if (prevRes?.links?.next) {
				prevRes = await fetch(prevRes?.links?.next).then((r) => r.json());
				resData.push(...prevRes?.data);
				resIncluded.push(...prevRes?.included);
			}
		}

		const result = resData.map((pool) => {
			const token0Id = pool?.relationships?.tokens?.data[0]?.id;
			const token1Id = pool?.relationships?.tokens?.data[1]?.id;

			const token0 = resIncluded?.find((item) => item?.id === token0Id)?.attributes || {};
			const token1 = resIncluded?.find((item) => item?.id === token1Id)?.attributes || {};

			return { ...pool, token0, token1 };
		});

		return [chainId, result || []];
	} catch (error) {
		return [chainId, []];
	}
};
