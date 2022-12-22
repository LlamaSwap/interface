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
	okc: 66,
	fuse: 122,
	moonbeam: 1284
};

export const chainNamesReplaced = {
	bsc: 'BSC',
	avax: 'Avalanche',
	okc: 'OKX',
	bttc: 'BitTorrent'
};

export const nativeAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'.toLowerCase();

export const topTokens = {
	ethereum: ['ETH', 'USDT', 'WBTC']
};

// amount and slippage to test liquidity of a token
export const liquidity = [
	{ amount: 500, slippage: 0.01 },
	{ amount: 1_000, slippage: 0.01 },
	{ amount: 1_000_000, slippage: 0.1 },
	{ amount: 10_000_000, slippage: 1 },
	{ amount: 50_000_000, slippage: 10 },
	{ amount: 100_000_000, slippage: 30 },
	{ amount: 500_000_000, slippage: 90 }
];
