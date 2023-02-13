import { Chain, chain } from 'wagmi';
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
		default: 'https://mainnet.boba.network'
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
		default: 'https://rpc.ankr.com/bsc'
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
		default: 'https://mainnet.boba.network'
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
		default: 'https://api.s0.t.hmny.io'
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
		default: 'https://http-mainnet.hecochain.com'
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
		default: 'https://evmexplorer.velas.com/rpc'
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
		default: 'https://emerald.oasis.dev'
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
		default: 'https://rpc.bittorrentchain.io'
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
		default: 'https://rpc.api.moonbeam.network'
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
		default: 'https://rpc.fuse.io'
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
		default: 'https://moonriver.public.blastapi.io'
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
		default: 'https://dogechain.ankr.com'
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
		default: 'https://evm.cronos.org'
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
		default: 'https://rpc.ankr.com/celo'
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
		default: 'https://mainnet.aurora.dev'
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
		default: 'https://avalanche-evm.publicnode.com'
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
		default: 'https://cypress.fandom.finance/archive'
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
		default: 'https://rpc.ftm.tools'
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
		default: 'https://rpc.ankr.com/gnosis'
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
		default: 'https://rpc.ankr.com/polygon'
	},
	blockExplorers: {
		default: { name: 'PolygonScan', url: 'https://polygonscan.com' }
	},
	testnet: false
};

const canto = {
	id: 7700,
	name: 'Canto',
	network: 'Canto',
	iconUrl: chainIconUrl('canto'),
	iconBackground: '#000',
	nativeCurrency: {
		decimals: 18,
		name: 'Canto',
		symbol: 'CANTO'
	},
	rpcUrls: {
		default: 'https://canto.neobase.one'
	},
	blockExplorers: {
		default: { name: 'CantoScan', url: 'https://evm.explorer.canto.io' }
	},
	testnet: false
};

const arbirum = {
	...chain.arbitrum,
	rpcUrls: {
		default: 'https://rpc.ankr.com/arbitrum'
	},
	iconUrl: chainIconUrl('arbitrum')
};
const ethereum = {
	...chain.mainnet,
	rpcUrls: {
		default: 'https://rpc.ankr.com/eth'
	},
	iconUrl: chainIconUrl('ethereum')
};
const optimism = {
	...chain.optimism,
	rpcUrls: {
		default: 'https://optimism.blockpi.network/v1/rpc/public'
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
	fuse,
	canto
];
