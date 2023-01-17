export const defillamaReferrerAddress = '0x08a3c2A819E3de7ACa384c798269B3Ce1CD0e437';

export const chainsMap = {
	ethereum: 1,
	bsc: 56,
	polygon: 137,
	optimism: 10,
	arbitrum: 42161,
	avax: 43114,
	gnosis: 100,
	fantom: 250,
	klaytn: 8217,
	aurora: 1313161554,
	celo: 42220,
	cronos: 25,
	dogechain: 2000,
	moonriver: 1285,
	bttc: 199,
	oasis: 42262,
	velas: 106,
	heco: 128,
	harmony: 1666600000,
	boba: 288,
	okexchain: 66,
	fuse: 122,
	moonbeam: 1284
} as const;

export const geckoChainsMap: Record<string, typeof chainsMap[keyof typeof chainsMap]> = {
	ethereum: 1,
	'binance-smart-chain': 56,
	'polygon-pos': 137,
	'optimistic-ethereum': 10,
	'arbitrum-one': 42161,
	avalanche: 43114,
	xdai: 100,
	fantom: 250,
	'klay-token': 8217,
	aurora: 1313161554,
	celo: 42220,
	cronos: 25,
	dogechain: 2000,
	moonriver: 1285,
	bittorrent: 199,
	oasis: 42262,
	velas: 106,
	heco: 128,
	'harmony-shard-0': 1666600000,
	boba: 288,
	'okex-chain': 66,
	fuse: 122,
	moonbeam: 1284
};

export const dexToolsChainMap: Record<typeof chainsMap[keyof typeof chainsMap], string> = {
	1: 'ether',
	56: 'bsc',
	137: 'polygon',
	10: 'optimism',
	42161: 'arbitrum',
	43114: 'avalanche',
	100: 'gnosis',
	250: 'fantom',
	1313161554: 'aurora',
	42220: 'celo',
	25: 'cronos',
	2000: 'dogechain',
	1285: 'moonriver',
	42262: 'oasis',
	106: 'velas',
	128: 'heco',
	1666600000: 'harmony',
	288: 'boba',
	66: 'okc',
	122: 'fuse',
	1284: 'moonbeam',
	199: 'bittorrent',
	8217: 'klay'
};

export const chainIdToName = (chainId) => {
	return Object.entries(chainsMap).find(([, id]) => String(id) === String(chainId))?.[0];
};

export const chainNamesReplaced = {
	bsc: 'BSC',
	avax: 'Avalanche',
	okexchain: 'OKX',
	bttc: 'BitTorrent'
};

export const nativeAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'.toLowerCase();

export const initialLiquidity = [500, 1_000, 10_000, 100_000, 1_000_000, 10_000_000, 100_000_000, 500_000_000];
