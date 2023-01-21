import { arbitrum as WArbitrum, mainnet as WMainnet, optimism as WOptimism, Chain } from 'wagmi/chains';
import { chainIconUrl } from '~/utils/index';

const okx = {
	id: 66,
	name: 'OKX',
	network: 'okx',
	iconUrl: chainIconUrl('okexchain'),
	iconBackground: '#000',
	nativeCurrency: {
		decimals: 18,
		name: 'OKT',
		symbol: 'OKT'
	},
	rpcUrls: {
		default: { http: ['https://mainnet.boba.network'] },
		public: { http: ['https://mainnet.boba.network'] }
	},
	blockExplorers: {
		default: { name: 'OKLink', url: 'https://www.oklink.com/en/okc' }
	},
	testnet: false
};

const binance = {
	id: 56,
	name: 'Binance SmartChain',
	network: 'binance',
	iconUrl: chainIconUrl('binance'),
	iconBackground: '#000',
	nativeCurrency: {
		decimals: 18,
		name: 'Binance',
		symbol: 'BNB'
	},
	rpcUrls: {
		default: { http: ['https://rpc.ankr.com/bsc'] },
		public: { http: ['https://rpc.ankr.com/bsc'] }
	},
	blockExplorers: {
		default: { name: 'BSCScan', url: 'https://bscscan.com' }
	},
	testnet: false
};

const boba = {
	id: 288,
	name: 'Boba',
	network: 'boba',
	iconUrl: chainIconUrl('boba'),
	iconBackground: '#000',
	nativeCurrency: {
		decimals: 18,
		name: 'Ethereum',
		symbol: 'ETH'
	},
	rpcUrls: {
		default: { http: ['https://mainnet.boba.network'] },
		public: { http: ['https://mainnet.boba.network'] }
	},
	blockExplorers: {
		default: { name: 'BobaScan', url: 'https://bobascan.com' }
	},
	testnet: false
};

const harmony = {
	id: 1666600000,
	name: 'Harmony',
	network: 'harmony',
	iconUrl: chainIconUrl('harmony'),
	iconBackground: '#000',
	nativeCurrency: {
		decimals: 18,
		name: 'Harmony',
		symbol: 'ONE'
	},
	rpcUrls: {
		default: { http: ['https://api.s0.t.hmny.io'] },
		public: { http: ['https://api.s0.t.hmny.io'] }
	},
	blockExplorers: {
		default: {
			name: 'Harmony Explorer',
			url: 'https://explorer.harmony.one'
		}
	},
	testnet: false
};

const heco = {
	id: 128,
	name: 'Heco',
	network: 'heco',
	iconUrl: chainIconUrl('heco'),
	iconBackground: '#000',
	nativeCurrency: {
		decimals: 18,
		name: 'Huobi Token',
		symbol: 'HT'
	},
	rpcUrls: {
		default: { http: ['https://http-mainnet.hecochain.com'] },
		public: { http: ['https://http-mainnet.hecochain.com'] }
	},
	blockExplorers: {
		default: {
			name: 'HecoScan',
			url: 'https://www.hecoinfo.com/en-us'
		}
	},
	testnet: false
};

const velas = {
	id: 106,
	name: 'Velas',
	network: 'velas',
	iconUrl: chainIconUrl('velas'),
	iconBackground: '#000',
	nativeCurrency: {
		decimals: 18,
		name: 'Velas',
		symbol: 'VLX'
	},
	rpcUrls: {
		default: { http: ['https://evmexplorer.velas.com/rpc'] },
		public: { http: ['https://evmexplorer.velas.com/rpc'] }
	},
	blockExplorers: {
		default: { name: 'VelaScan', url: 'https://velascan.org' }
	},
	testnet: false
};

const oasis = {
	id: 42262,
	name: 'Oasis',
	network: 'oasis',
	iconUrl: chainIconUrl('oasis'),
	iconBackground: '#000',
	nativeCurrency: {
		decimals: 18,
		name: 'Oasis',
		symbol: 'ROSE'
	},
	rpcUrls: {
		default: { http: ['https://emerald.oasis.dev'] },
		public: { http: ['https://emerald.oasis.dev'] }
	},
	blockExplorers: {
		default: { name: 'OasisScan', url: 'https://www.oasisscan.com' }
	},
	testnet: false
};

const bttc = {
	id: 199,
	name: 'BitTorrent',
	network: 'bttc',
	iconUrl: chainIconUrl('bittorrent'),
	iconBackground: '#000',
	nativeCurrency: {
		decimals: 18,
		name: 'BitTorrent',
		symbol: 'BTT'
	},
	rpcUrls: {
		default: { http: ['https://rpc.bittorrentchain.io'] },
		public: { http: ['https://rpc.bittorrentchain.io'] }
	},
	blockExplorers: {
		default: { name: 'BTTScan', url: 'https://bttcscan.com' }
	},
	testnet: false
};

const moonbeam = {
	id: 1284,
	name: 'Moonbeam',
	network: 'moonbeam',
	iconUrl: chainIconUrl('moonbeam'),
	iconBackground: '#000',
	nativeCurrency: {
		decimals: 18,
		name: 'Moonbeam',
		symbol: 'GLMR'
	},
	rpcUrls: {
		default: { http: ['https://rpc.api.moonbeam.network'] },
		public: { http: ['https://rpc.api.moonbeam.network'] }
	},
	blockExplorers: {
		default: {
			name: 'MoonScan',
			url: 'https://moonscan.io'
		}
	},
	testnet: false
};

const fuse = {
	id: 122,
	name: 'Fuse',
	network: 'fuse',
	iconUrl: chainIconUrl('fuse'),
	iconBackground: '#000',
	nativeCurrency: {
		decimals: 18,
		name: 'Fuse',
		symbol: 'FUSE'
	},
	rpcUrls: {
		default: { http: ['https://rpc.fuse.io'] },
		public: { http: ['https://rpc.fuse.io'] }
	},
	blockExplorers: {
		default: {
			name: 'Fuse Explorer',
			url: 'https://explorer.fuse.io'
		}
	},
	testnet: false
};

const moonriver = {
	id: 1285,
	name: 'MoonRiver',
	network: 'moonriver',
	iconUrl: chainIconUrl('moonriver'),
	iconBackground: '#000',
	nativeCurrency: {
		decimals: 18,
		name: 'Moonriver',
		symbol: 'MOVR'
	},
	rpcUrls: {
		default: { http: ['https://moonriver.public.blastapi.io'] },
		public: { http: ['https://moonriver.public.blastapi.io'] }
	},
	blockExplorers: {
		default: {
			name: 'MoonScan',
			url: 'https://moonriver.moonscan.io'
		}
	},
	testnet: false
};

const dogechain = {
	id: 2000,
	name: 'DogeChain',
	network: 'doge',
	iconUrl: chainIconUrl('dogechain'),
	iconBackground: '#000',
	nativeCurrency: {
		decimals: 18,
		name: 'Doge',
		symbol: 'DOGE'
	},
	rpcUrls: {
		default: { http: ['https://dogechain.ankr.com'] },
		public: { http: ['https://dogechain.ankr.com'] }
	},
	blockExplorers: {
		default: {
			name: 'DogeChain Explorer',
			url: 'https://explorer.dogechain.dog'
		}
	},
	testnet: false
};

const cronos = {
	id: 25,
	name: 'Cronos',
	network: 'cronos',
	iconUrl: chainIconUrl('cronos'),
	iconBackground: '#000',
	nativeCurrency: {
		decimals: 18,
		name: 'Cronos',
		symbol: 'CRO'
	},
	rpcUrls: {
		default: { http: ['https://evm.cronos.org'] },
		public: { http: ['https://evm.cronos.org'] }
	},
	blockExplorers: {
		default: { name: 'CronosScan', url: 'https://cronoscan.com' }
	},
	testnet: false
};
const celo = {
	id: 42220,
	name: 'Celo',
	network: 'celo',
	iconUrl: chainIconUrl('celo'),
	iconBackground: '#000',
	nativeCurrency: {
		decimals: 18,
		name: 'Celo',
		symbol: 'CELO'
	},
	rpcUrls: {
		default: { http: ['https://rpc.ankr.com/celo'] },
		public: { http: ['https://rpc.ankr.com/celo'] }
	},
	blockExplorers: {
		default: { name: 'CeloScan', url: 'https://celoscan.io' }
	},
	testnet: false
};
const aurora = {
	id: 1313161554,
	name: 'Aurora',
	network: 'aurora',
	iconUrl: chainIconUrl('aurora'),
	iconBackground: '#000',
	nativeCurrency: {
		decimals: 18,
		name: 'Ethereum',
		symbol: 'ETH'
	},
	rpcUrls: {
		default: { http: ['https://mainnet.aurora.dev'] },
		public: { http: ['https://mainnet.aurora.dev'] }
	},
	blockExplorers: {
		default: { name: 'AuroraScan', url: 'https://aurorascan.dev' }
	},
	testnet: false
};
const avax = {
	id: 43114,
	name: 'AVAX',
	network: 'avax',
	iconUrl: chainIconUrl('avax'),
	iconBackground: '#000',
	nativeCurrency: {
		decimals: 18,
		name: 'Avalanche',
		symbol: 'AVAX'
	},
	rpcUrls: {
		default: { http: ['https://avalanche-evm.publicnode.com'] },
		public: { http: ['https://avalanche-evm.publicnode.com'] }
	},
	blockExplorers: {
		default: { name: 'SnowTrace', url: 'https://snowtrace.io' }
	},
	testnet: false
};

const klaytn = {
	id: 8217,
	name: 'Klaytn',
	network: 'Klaytn',
	iconUrl: chainIconUrl('klaytn'),
	iconBackground: '#000',
	nativeCurrency: {
		decimals: 18,
		name: 'Klaytn',
		symbol: 'KLAY'
	},
	rpcUrls: {
		default: { http: ['https://cypress.fandom.finance/archive'] },
		public: { http: ['https://cypress.fandom.finance/archive'] }
	},
	blockExplorers: {
		default: {
			name: 'KlaytnScope',
			url: 'https://scope.klaytn.com'
		}
	},
	testnet: false
};
const fantom = {
	id: 250,
	name: 'Fantom Opera',
	network: 'fantom',
	iconUrl: chainIconUrl('fantom'),
	iconBackground: '#000',
	nativeCurrency: {
		decimals: 18,
		name: 'Fantom',
		symbol: 'FTM'
	},
	rpcUrls: {
		default: { http: ['https://rpc.ftm.tools'] },
		public: { http: ['https://rpc.ftm.tools'] }
	},
	blockExplorers: {
		default: { name: 'FTMScan', url: 'https://ftmscan.com' }
	},
	testnet: false
};

const gnosis = {
	id: 100,
	name: 'Gnosis',
	network: 'gnosis',
	iconUrl: chainIconUrl('gnosis'),
	iconBackground: '#000',
	nativeCurrency: {
		decimals: 18,
		name: 'xDai',
		symbol: 'xDai'
	},
	rpcUrls: {
		default: { http: ['https://rpc.ankr.com/gnosis'] },
		public: { http: ['https://rpc.ankr.com/gnosis'] }
	},
	blockExplorers: {
		default: { name: 'GnosisScan', url: 'https://gnosisscan.io' }
	},
	testnet: false
};
const polygon = {
	id: 137,
	name: 'Polygon',
	network: 'polygon',
	iconUrl: chainIconUrl('polygon'),
	iconBackground: '#000',
	nativeCurrency: {
		decimals: 18,
		name: 'Matic',
		symbol: 'MATIC'
	},
	rpcUrls: {
		default: { http: ['https://rpc.ankr.com/polygon'] },
		public: { http: ['https://rpc.ankr.com/polygon'] }
	},
	blockExplorers: {
		default: { name: 'PolygonScan', url: 'https://polygonscan.com' }
	},
	testnet: false
};

const arbirum = {
	...WArbitrum,
	rpcUrls: {
		default: { http: ['https://rpc.ankr.com/arbitrum'] },
		public: { http: ['https://rpc.ankr.com/arbitrum'] }
	},
	iconUrl: chainIconUrl('arbitrum')
};
const ethereum = {
	...WMainnet,
	rpcUrls: {
		default: { http: ['https://eth-mainnet.public.blastapi.io'] },
		public: { http: ['https://eth-mainnet.public.blastapi.io'] }
	},
	iconUrl: chainIconUrl('ethereum')
};
const optimism = {
	...WOptimism,
	rpcUrls: {
		default: { http: ['https://optimism-mainnet.public.blastapi.io'] },
		public: { http: ['https://optimism-mainnet.public.blastapi.io'] }
	},
	iconUrl: chainIconUrl('optimism')
};

interface IChain extends Chain {
	iconUrl: string;
}

export const allChains: Array<IChain> = [
	polygon,
	binance,
	oasis,
	fantom,
	velas,
	harmony,
	gnosis,
	klaytn,
	avax,
	aurora,
	cronos,
	celo,
	moonriver,
	heco,
	boba,
	okx,
	bttc,
	dogechain,
	optimism,
	arbirum,
	ethereum,
	moonbeam,
	fuse
];
