export const defillamaReferrerAddress = '0x08a3c2A819E3de7ACa384c798269B3Ce1CD0e437';
export const altReferralAddress = '0xa43C3EDe995AA058B68B882c6aF16863F18c5330';

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
	moonbeam: 1284,
	canto: 7700,
	zksync: 324,
	polygonzkevm: 1101,
	ontology: 58,
	kava: 2222,
	pulse: 369,
	metis: 1088,
	base: 8453,
	linea: 59144,
	mode: 34443,
	mantle: 5000,
	scroll: 534352,
	sonic: 146
} as const;

export const geckoChainsMap: Record<string, number> = {
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
	moonbeam: 1284,
	canto: 7700,
	'polygon-zkevm': 1101,
	zksync: 324,
	pulsechain: 369,
	kava: 2222,
	ontology: 58,
	'metis-andromeda': 1088,
	linea: 59144,
	base: 8453,
	mode: 34443,
	mantle: 5000,
	scroll: 534352,
	sonic: 146
};

export const chainGasToken: Record<keyof typeof chainsMap, string> = {
	ethereum: 'ethereum',
	bsc: 'binancecoin',
	polygon: 'matic-network',
	optimism: 'ethereum',
	arbitrum: 'ethereum',
	avax: 'avalanche-2',
	gnosis: 'xdai',
	fantom: 'fantom',
	klaytn: 'klay-token',
	aurora: 'ethereum',
	celo: 'celo',
	cronos: 'crypto-com-chain',
	dogechain: 'dogecoin',
	moonriver: 'moonriver',
	bttc: 'bittorrent',
	oasis: 'oasis-network',
	velas: 'velas',
	heco: 'huobi-token',
	harmony: 'harmony',
	boba: 'ethereum',
	okexchain: 'oec-token',
	fuse: 'fuse-network-token',
	moonbeam: 'moonbeam',
	canto: 'canto',
	zksync: 'ethereum',
	polygonzkevm: 'ethereum',
	ontology: 'ontology',
	kava: 'kava',
	pulse: 'pulsechain',
	metis: 'metis-token',
	base: 'ethereum',
	linea: 'ethereum',
	mode: 'ethereum',
	mantle: 'mantle',
	scroll: 'ethereum',
	sonic: "sonic"
};

export const geckoTerminalChainsMap = {
	1: 'eth',
	56: 'bsc',
	137: 'polygon_pos',
	10: 'optimism',
	42161: 'arbitrum',
	43114: 'avax',
	100: 'gnosis',
	250: 'ftm',
	1313161554: 'aurora',
	42220: 'celo',
	25: 'cro',
	2000: 'dogechain',
	1285: 'movr',
	42262: 'oasis',
	106: 'velas',
	128: 'heco',
	1666600000: 'one',
	288: 'boba',
	66: 'okexchain',
	122: 'fuse',
	1284: 'glmr',
	199: 'bttc',
	8217: 'klaytn',
	7700: 'canto',
	2222: 'kava',
	369: 'pulsechain',
	1101: 'polygon-zkevm',
	324: 'zksync',
	1088: 'metis',
	8453: 'base',
	59144: 'linea'
};

export const chainIdToName = (chainId) => {
	return Object.entries(chainsMap).find(([, id]) => String(id) === String(chainId))?.[0];
};

export const chainNamesReplaced = {
	bsc: 'BSC',
	avax: 'Avalanche',
	okexchain: 'OKTChain',
	bttc: 'BitTorrent'
};

export const nativeAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'.toLowerCase();

export const initialLiquidity = [500, 1_000, 10_000, 100_000, 1_000_000, 10_000_000, 100_000_000, 500_000_000];

export const WETH = {
	ethereum: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'.toLowerCase()
};
export const PRICE_IMPACT_MEDIUM_THRESHOLD = 5;
export const PRICE_IMPACT_HIGH_THRESHOLD = 10;
export const PRICE_IMPACT_WARNING_THRESHOLD = 3;

export const tokenApprovalAbi = [
	{
		constant: false,
		inputs: [
			{ name: '_spender', type: 'address' },
			{ name: '_value', type: 'uint256' }
		],
		name: 'approve',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function'
	}
] as const