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

export const wrappedTokensByChain = {
	1: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // Ethereum: WETH
	56: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // BSC: WBNB
	137: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270', // Polygon: WPOL
	10: '0x4200000000000000000000000000000000000006', // Optimism: WETH
	42161: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1', // Arbitrum: WETH
	43114: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', // Avalanche: WAVAX
	100: '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d', // Gnosis: WXDAI
	250: '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83', // Fantom: WFTM
	8217: '0x19aac5f612f524b754ca7e7c41cbfa2e981a4432',  // Klaytn: WKLAY
	1313161554:null , // Aurora
	42220: '0x2021B12D8138e2D63cF0895eccABC0DFc92416c6', // Celo: WCELO
	25: null,    // Cronos
	2000: null,  // Dogechain
	1285: '0x98878b06940ae243284ca214f92bb71a2b032b8a',  // Moonriver: WMOVR
	199: '0x23181f21dea5936e24163ffaba4ea3b316b57f3c',   // BitTorrent: WBTT
	106: null,   // Velas
	128: null,   // Heco
	1666600000: '0xcF664087a5bB0237a0BAd6742852ec6c8d69A27a', // Harmony: WONE
	288: '0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000',    // Boba: WETH
	66: '0x8F8526dbfd6E38E3D8307702cA8469Bae6C56C15',    // OKX: WOKT
	122: '0x0BE9e53fd7EDaC9F859882AfdDa116645287C629',   // Fuse: WFUSE
	1284: '0xacc15dc74880c9944775448304b263d191c6077f',   // Moonbeam: WGLMR
	7700: '0x826551890dc65655a0aceca109ab11abdbd7a07b',   // Canto: WCANTO
	324: '0xf00DAD97284D0c6F06dc4Db3c32454D4292c6813',    // zkSync: WETH
	1101: '0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9',   // Polygon zkEVM: WETH
	58: '0x219cc8e994ea6b35cdcffb5d44e229325d5ad02a',     // Ontology: WONT
	2222: '0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b',   // Kava: WKAVA
	369: '0xA1077a294dDE1B09bB078844df40758a5D0f9a27',     // PulseChain: WPLS
	1088: '0x75cb093E4D61d2A2e65D8e0BBb01DE8d89b53481',    // Metis: WMETIS
	8453: '0x4200000000000000000000000000000000000006',    // Base: WETH
	59144: '0xe5d7c2a44ffddf6b295a15c148167daaaf5cf34f',   // Linea: WETH
	34443: '0x4200000000000000000000000000000000000006',   // Mode: WETH
	5000: '0x78c1b0c915c4faa5fffa6cabf0219da63d7f4cb8',    // Mantle: WMNT
	534352: '0x5300000000000000000000000000000000000004',  // Scroll: WETH
	146: '0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38' // Sonic: wS
} as const;