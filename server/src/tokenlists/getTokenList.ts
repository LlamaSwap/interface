import { groupBy, mapValues, uniqBy } from 'lodash';
import { nativeTokens } from './nativeTokens';
import { geckoChainsMap, geckoTerminalChainsMap } from './constants';
import { ownTokenList } from './ownTokenlist';
import multichainListRawFantom from './multichain/250.json';
import multichainListRawAll from './multichain/anyswap.json';
import { getTokensData } from './getTokensData';
import type { IToken } from './types';
import { zeroAddress } from 'viem';

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
	//klaytn: 8217,
	base: 8453,
	zksync: 324,
	aurora: 1313161554
};

const tokensToFix = {
	1: {
		['0xb01dd87B29d187F3E3a4Bf6cdAebfb97F3D9aB98'.toLowerCase()]: {
			name: 'BOLD (legacy)' // BOLD -> BOLD (legacy)
		},
		['0x6b175474e89094c44da98b954eedeac495271d0f'.toLowerCase()]: {
			symbol: 'DAI' // XDAI -> DAI
		}
	},
	43114: {
		['0x152b9d0fdc40c096757f570a51e494bd4b943e50'.toLowerCase()]: {
			symbol: 'BTC.b' // BTC -> BTC.b
		}
	}
}

const markMultichain = (tokens) => {
	const multichainTokens = {};
	multichainListRawAll.bridgeList.map((multi) => {
		if (!multichainTokens[multi.chainId]) {
			multichainTokens[multi.chainId] = {};
		}
		multichainTokens[multi.chainId][multi.token?.toLowerCase()] = true;
	});
	Object.values(multichainListRawFantom).map((t) => {
		multichainTokens[FANTOM_ID][t.address?.toLowerCase()] = true;
	});
	Object.entries(tokens).map(([chainId, tokensOnChain]: [string, any[]]) =>
		tokensOnChain.map((token) => {
			if (token.symbol.startsWith('any') || multichainTokens[chainId]?.[token.address.toLowerCase()] === true) {
				token.isMultichain = true;
			}
		})
	);

	return tokens;
};

const allSettled = (promises) =>
	Promise.all(
		promises.map((p) =>
			p
				.then((value) => ({
					status: 'fulfilled',
					value
				}))
				.catch((reason) => ({
					status: 'rejected',
					reason
				}))
		)
	);

const chainsToFetchFromKyberswap = [324, 1101, 59144, 534352, 146];

async function getFullCGTokenlist(){
	const cgCoins = (await fetch("https://api.coingecko.com/api/v3/coins/list?include_platform=true").then(r => r.json())) as {
        "id": string;
        "symbol": string;
        "name": string;
        "platforms": {
            [platform: string]: string
        }
    }[];

    return cgCoins.map(coin => ({
        name: coin.name,
        symbol: coin.symbol,
        platforms: coin.platforms,
    }))
}

export async function getTokenList() {
	// const uniList = await fetch('https://tokens.uniswap.org/').then((r) => r.json());
	// const sushiList = await fetch('https://token-list.sushi.com/').then((r) => r.json());

	const oneInch = await Promise.all(
		Object.values(oneInchChains).map(async (chainId) => {
			for (let i = 0; i < 3; i++) {
				try {
					return await fetch(`https://tokens.1inch.io/v1.1/${chainId}`).then((r) => r.json());
				} catch (e) {}
			}
			throw new Error(`Failed fetching 1inch tokens for chain ${chainId}`);
		})
	);

	const [geckoList, kyberswapLists] = await Promise.all([
		getFullCGTokenlist(),
		await Promise.all(
			chainsToFetchFromKyberswap.map((chainId) =>
				fetch(
					`https://ks-setting.kyberswap.com/api/v1/tokens?page=1&pageSize=100&isWhitelisted=true&chainIds=${chainId}`
				)
					.then((r) => r.json())
					.then((r) => r?.data?.tokens.filter((t) => t.chainId === chainId))
			)
		)
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
			[...nativeTokens, ...ownTokenList, ...oneInchList, ...kyberswapLists.flat()].filter(
				(t) => t.address !== '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
			),
			'chainId'
		),
		(val) => uniqBy(val, (token: IToken) => token.address.toLowerCase())
	);

	let tokensFiltered = mapValues(tokensByChain, (val, key) => {
		return val
			.filter((token) => typeof token.address === 'string' && !tokensToRemove[key]?.[token.address.toLowerCase()])
			.map((token) => ({ ...token, address: token.address.toLowerCase() }));
	});

	tokensFiltered = markMultichain(tokensFiltered);

	// get top tokens on each chain
	const topTokensByChain = await Promise.all(Object.keys(tokensFiltered).map((chain) => getTopTokensByChain(chain)));

	const topTokensByVolume = Object.fromEntries(
		topTokensByChain.filter((chain) => chain !== null && tokensFiltered[chain[0] as string])
	);

	// store unique tokens by chain
	const uniqueTokenList = {};

	for (const chain in tokensFiltered) {
		tokensFiltered[chain].forEach((token) => {
			if (!uniqueTokenList[chain]) {
				uniqueTokenList[chain] = new Set();
			}

			uniqueTokenList[chain].add(token.address.toLowerCase());
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
	const geckoTokensList = (
		await allSettled(
			Object.entries(geckoListByChain).map(([chain, tokens]: [string, Set<string>]) =>
				getTokensData([chain, Array.from(tokens || new Set())])
			)
		)
	).map((t: any) => t.value);
	Object.entries(geckoTokensList).map((v) => {
		if (v[1] === undefined) {
			throw new Error(`Failed getting getTokensData for chain ${Object.entries(geckoListByChain)[v[0]][0]}`);
		}
	});

	const formatAndSortTokens = (tokens, chain) => {
		return tokens
			.map((t) => {
				const address = t.address.toLowerCase()
				const volume24h = topTokensByVolume[chain]?.[address] ?? 0;
				const details = {...t, ...(tokensToFix[chain]?.[address] || {})}
				return {
					...details,
					address,
					label: details.symbol,
					value: address,
					logoURI: details.ownLogoURI || `https://token-icons.llamao.fi/icons/tokens/${details.chainId}/${address}?h=48&w=48`,
					logoURI2: details.logoURI || null,
					volume24h
				};
			})
			.sort((a, b) => (b.address === zeroAddress ? 1 : b.volume24h - a.volume24h));
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
	for (const chain in { ...tokensFiltered, ...cgList }) {
		tokenlist[chain] = [...formatAndSortTokens(tokensFiltered[chain] || [], chain), ...(cgList[chain] || [])].sort((a,b)=>(b.volume24h ?? 0) - (a.volume24h ?? 0));
	}

	return tokenlist;
}

const getTopTokensByChain = async (chainId: string) => {
	try {
		// Skip if not Ethereum or chain not supported in geckoTerminal
		if (!geckoTerminalChainsMap[chainId]) {
			return [chainId, {}];
		}

		const resData: any[] = [];
		const PAGE_LIMIT = 5;

		// Fetch data from multiple pages in parallel
		const pagePromises = Array.from({ length: PAGE_LIMIT }, (_, i) =>
			fetch(
				`https://pro-api.coingecko.com/api/v3/onchain/networks/${geckoTerminalChainsMap[chainId]}/pools?` +
					'include=dex%2Cdex.network%2Cdex.network.network_metric%2Ctokens&' +
					`page=${i + 1}&include_network_metrics=true`,
				{
					headers: {
						"x-cg-pro-api-key": process.env.CG_API_KEY!
					}
				}
			)
				.then((r) => r.json())
				.catch(() => ({ data: [], included: [] }))
		);

		const responses = await Promise.allSettled(pagePromises);
		responses.forEach((response) => {
			if (response.status === 'fulfilled' && response.value.data) {
				resData.push(...response.value.data);
			} else {
				console.log(geckoTerminalChainsMap[chainId], response)
			}
		});

		const volumeByTokens = {};

		for (const pool of resData) {
			const token = pool.relationships.base_token.data.id.split('_')[1].toLowerCase();
			volumeByTokens[token] = (volumeByTokens[token] || 0) + Number((pool.attributes?.volume_usd?.h24 || '0').split(".")[0]);
		}

		return [chainId, volumeByTokens];
	} catch (error) {
		console.error(`Error fetching top tokens for chain ${chainId}:`, error);
		return [chainId, {}];
	}
};
