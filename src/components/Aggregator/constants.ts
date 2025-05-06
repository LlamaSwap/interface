import { zeroAddress } from 'viem';

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
	sonic: 'sonic'
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
] as const;

export const wrappedTokensByChain = {
	1: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // Ethereum: WETH
	56: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // BSC: WBNB
	137: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270', // Polygon: WPOL
	10: '0x4200000000000000000000000000000000000006', // Optimism: WETH
	42161: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1', // Arbitrum: WETH
	43114: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', // Avalanche: WAVAX
	100: '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d', // Gnosis: WXDAI
	250: '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83', // Fantom: WFTM
	8217: '0x19aac5f612f524b754ca7e7c41cbfa2e981a4432', // Klaytn: WKLAY
	1313161554: null, // Aurora
	42220: '0x2021B12D8138e2D63cF0895eccABC0DFc92416c6', // Celo: WCELO
	25: null, // Cronos
	2000: null, // Dogechain
	1285: '0x98878b06940ae243284ca214f92bb71a2b032b8a', // Moonriver: WMOVR
	199: '0x23181f21dea5936e24163ffaba4ea3b316b57f3c', // BitTorrent: WBTT
	106: null, // Velas
	128: null, // Heco
	1666600000: '0xcF664087a5bB0237a0BAd6742852ec6c8d69A27a', // Harmony: WONE
	288: '0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000', // Boba: WETH
	66: '0x8F8526dbfd6E38E3D8307702cA8469Bae6C56C15', // OKX: WOKT
	122: '0x0BE9e53fd7EDaC9F859882AfdDa116645287C629', // Fuse: WFUSE
	1284: '0xacc15dc74880c9944775448304b263d191c6077f', // Moonbeam: WGLMR
	7700: '0x826551890dc65655a0aceca109ab11abdbd7a07b', // Canto: WCANTO
	324: '0xf00DAD97284D0c6F06dc4Db3c32454D4292c6813', // zkSync: WETH
	1101: '0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9', // Polygon zkEVM: WETH
	58: '0x219cc8e994ea6b35cdcffb5d44e229325d5ad02a', // Ontology: WONT
	2222: '0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b', // Kava: WKAVA
	369: '0xA1077a294dDE1B09bB078844df40758a5D0f9a27', // PulseChain: WPLS
	1088: '0x75cb093E4D61d2A2e65D8e0BBb01DE8d89b53481', // Metis: WMETIS
	8453: '0x4200000000000000000000000000000000000006', // Base: WETH
	59144: '0xe5d7c2a44ffddf6b295a15c148167daaaf5cf34f', // Linea: WETH
	34443: '0x4200000000000000000000000000000000000006', // Mode: WETH
	5000: '0x78c1b0c915c4faa5fffa6cabf0219da63d7f4cb8', // Mantle: WMNT
	534352: '0x5300000000000000000000000000000000000004', // Scroll: WETH
	146: '0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38' // Sonic: wS
} as const;

export const topTokensByChain = {
	1: [
		zeroAddress, // ETH
		'0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
		'0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
		'0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', // WBTC
		'0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' // WETH
	],
	56: [
		zeroAddress, // BNB
		'0x55d398326f99059ff775485246999027b3197955', // USDT
		'0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', // USDC
		'0x2170ed0880ac9a755fd29b2688956bd959f933f8' // ETH
	],
	137: [
		zeroAddress, // POL
		'0x3c499c542cef5e3811e1192ce70d8cc03d5c3359', // USDC
		'0xc2132d05d31c914a87c6611c10748aeb04b58e8f', // USDT
		'0x7ceb23fd6bc0add59e62ac25578270cff1b9f619' // WETH
	],
	10: [
		zeroAddress, // ETH
		'0x0b2c639c533813f4aa9d7837caf62653d097ff85', // USDC
		'0x94b008aa00579c1307b0ef2c499ad98a8ce58e58', // USDT
		'0x4200000000000000000000000000000000000042' // OP
	],
	42161: [
		zeroAddress, // ETH
		'0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9', // USDT
		'0xaf88d065e77c8cc2239327c5edb3a432268e5831', // USDC
		'0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f' // WBTC
	],
	43114: [
		zeroAddress, // AVAX
		'0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7', // USDT
		'0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e', // USDC
		'0x152b9d0FdC40C096757F570A51E494bd4b943E50' // BTC.b
	],
	100: [
		zeroAddress, // XDAI
		'0x4ecaba5870353805a9f068101a40e0f32ed605c6', // USDT
		'0xddafbb505ad214d7b80b1f830fccc89b60fb7a83', // USDC
		'0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1' // WETH
	],
	250: [],
	8217: [],
	1313161554: [],
	42220: [],
	25: [],
	2000: [],
	1285: [],
	199: [],
	106: [],
	128: [],
	1666600000: [],
	288: [],
	66: [],
	122: [],
	1284: [],
	7700: [],
	324: [
		'0x000000000000000000000000000000000000800A', // ETH
		'0x1d17CBcF0D6D143135aE902365D2E5e2A16538D4', // USDC
		'0x5A7d6b2F92C77FAD6CCaBd7EE0624E64907Eaf3E' // ZK
	],
	1101: [
		zeroAddress, // ETH
		'0xa8ce8aee21bc2a48a5ef670afcc9274c7bbbc035', // USDC
		'0x1e4a5963abfd975d8c9021ce480b42188849d41d', // USDT
		'0x22b21beddef74fe62f031d2c5c8f7a9f8a4b304d' // POL
	],
	58: [],
	2222: [],
	369: [],
	1088: [],
	8453: [
		zeroAddress, // ETH
		'0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', // USDC
		'0x820c137fa70c8691f0e44dc420a5e53c168921dc', // USDS
		'0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf' // cbBTC
	],
	59144: [
		zeroAddress, // ETH
		'0xa219439258ca9da29e9cc4ce5596924745e12b93', // USDT
		'0x176211869ca2b568f2a7d4ee941e073a821ee1ff', // USDC
		'0x3aab2285ddcddad8edf438c1bab47e1a9d05a9b4' // WBTC
	],
	34443: [],
	5000: [],
	534352: [
		zeroAddress, // ETH
		'0xf55bec9cafdbe8730f096aa55dad6d22d44099df', // USDT
		'0x06efdbff2a14a7c8e15944d1f4a48f9f95f663a4', // USDC
		'0x3c1bca5a656e69edcd0d4e36bebb3fcdaca60cf1', // WBTC
		'0x5300000000000000000000000000000000000004' // WETH
	],
	146: [
		zeroAddress, // S
		'0x29219dd400f2bf60e5a23d13be72b486d4038894', // USDC.e
		'0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38', // wS
		'0x50c42deacd8fc9773493ed674b675be577f2634b' // WETH
	]
};

export const EIP_5792_CHAINS = [1, 56];