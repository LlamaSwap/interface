import { Chain } from 'viem';
import { chainIconUrl } from '../Aggregator/nativeTokens';
import { rpcUrls } from '../Aggregator/rpcs';

const okx = {
	id: 66,
	name: 'OKTChain',
	network: 'okexchain',
	iconUrl: chainIconUrl('oktchain'),
	iconBackground: '#000',
	nativeCurrency: {
		decimals: 18,
		name: 'OKT',
		symbol: 'OKT'
	},
	rpcUrls: {
		default: { http: Object.values(rpcUrls[66]) }
	},
	blockExplorers: {
		default: { name: 'OKLink', url: 'https://www.oklink.com/en/okc' }
	},
	testnet: false
};

const binance = {
	id: 56,
	name: 'Binance SmartChain',
	network: 'bsc',
	iconUrl: chainIconUrl('binance'),
	iconBackground: '#000',
	nativeCurrency: {
		decimals: 18,
		name: 'Binance',
		symbol: 'BNB'
	},
	rpcUrls: {
		default: { http: Object.values(rpcUrls[56]) }
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
		default: { http: Object.values(rpcUrls[288]) }
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
		default: { http: Object.values(rpcUrls[1666600000]) }
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
		default: { http: Object.values(rpcUrls[128]) }
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
		default: { http: Object.values(rpcUrls[106]) }
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
		default: { http: Object.values(rpcUrls[42262]) }
	},
	blockExplorers: {
		default: { name: 'OasisScan', url: 'https://www.oasisscan.com' }
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
		default: { http: Object.values(rpcUrls[1284]) }
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
		default: { http: Object.values(rpcUrls[122]) }
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
		default: { http: Object.values(rpcUrls[1285]) }
	},
	blockExplorers: {
		default: {
			name: 'MoonScan',
			url: 'https://moonriver.moonscan.io'
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
		default: { http: Object.values(rpcUrls[25]) }
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
		default: { http: Object.values(rpcUrls[42220]) }
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
		default: { http: Object.values(rpcUrls[1313161554]) }
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
	iconUrl: chainIconUrl('avalanche'),
	iconBackground: '#000',
	nativeCurrency: {
		decimals: 18,
		name: 'Avalanche',
		symbol: 'AVAX'
	},
	rpcUrls: {
		default: { http: Object.values(rpcUrls[43114]) }
	},
	blockExplorers: {
		default: { name: 'SnowScan', url: 'https://snowscan.xyz' }
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
		default: { http: Object.values(rpcUrls[8217]) }
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
		default: { http: Object.values(rpcUrls[250]) }
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
		default: { http: Object.values(rpcUrls[100]) }
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
		name: 'Polygon',
		symbol: 'POL'
	},
	rpcUrls: {
		default: { http: Object.values(rpcUrls[137]) }
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
		default: { http: Object.values(rpcUrls[7700]) }
	},
	blockExplorers: {
		default: { name: 'CantoScan', url: 'https://evm.explorer.canto.io' }
	},
	testnet: false
};

const arbitrum = {
	id: 42161,
	name: 'Arbitrum',
	network: 'arbitrum',
	iconBackground: '#000',
	nativeCurrency: {
		decimals: 18,
		name: 'Ethereum',
		symbol: 'ETH'
	},
	blockExplorers: {
		default: { name: 'arbiscan', url: 'https://arbiscan.io' }
	},
	testnet: false,
	rpcUrls: {
		default: { http: Object.values(rpcUrls[42161]) }
	},
	iconUrl: chainIconUrl('arbitrum')
};
const ethereum = {
	id: 1,
	name: 'Ethereum',
	network: 'ethereum',
	iconBackground: '#000',
	nativeCurrency: {
		decimals: 18,
		name: 'Ethereum',
		symbol: 'ETH'
	},
	blockExplorers: {
		default: { name: 'etherscan', url: 'https://etherscan.io' }
	},
	testnet: false,
	rpcUrls: {
		default: { http: Object.values(rpcUrls[1]) }
	},
	iconUrl: chainIconUrl('ethereum')
};
const optimism = {
	id: 10,
	name: 'Optimism',
	network: 'optimism',
	iconBackground: '#000',
	nativeCurrency: {
		decimals: 18,
		name: 'Ethereum',
		symbol: 'ETH'
	},
	blockExplorers: {
		default: { name: 'etherscan', url: 'https://optimistic.etherscan.io' }
	},
	testnet: false,
	rpcUrls: {
		default: { http: Object.values(rpcUrls[10]) }
	},
	iconUrl: chainIconUrl('optimism')
};

const zksync = {
	id: 324,
	name: 'zkSync Era',
	network: 'zksync',
	iconUrl: chainIconUrl('zksync era'),
	iconBackground: '#000',
	nativeCurrency: {
		decimals: 18,
		name: 'Ethereum',
		symbol: 'ETH'
	},
	rpcUrls: {
		default: { http: Object.values(rpcUrls[324]) }
	},
	blockExplorers: {
		default: { name: 'zkScan', url: 'https://explorer.zksync.io' }
	},
	testnet: false
};

const ontology = {
	id: 58,
	name: 'OntologyEVM',
	network: 'ontology',
	iconUrl: chainIconUrl('OntologyEVM'),
	iconBackground: '#000',
	nativeCurrency: {
		decimals: 18,
		name: 'Ontology',
		symbol: 'ONT'
	},
	rpcUrls: {
		default: { http: Object.values(rpcUrls[58]) }
	},
	blockExplorers: {
		default: { name: 'Ontology Explorer', url: 'https://explorer.ont.io' }
	},
	testnet: false
};

const polygonZKEvm = {
	id: 1101,
	name: 'Polygon zkEVM',
	network: 'polygonzkevm',
	iconUrl: chainIconUrl('Polygon zkEVM'),
	iconBackground: '#000',
	nativeCurrency: {
		decimals: 18,
		name: 'Ethereum',
		symbol: 'ETH'
	},
	rpcUrls: {
		default: { http: Object.values(rpcUrls[1101]) }
	},
	blockExplorers: {
		default: { name: 'Polygon zkEVM Scan', url: 'https://zkevm.polygonscan.com' }
	},
	testnet: false
};

const kava = {
	id: 2222,
	name: 'Kava',
	network: 'kava',
	iconUrl: chainIconUrl('Kava'),
	iconBackground: '#000',
	nativeCurrency: {
		decimals: 18,
		name: 'Kava',
		symbol: 'KAVA'
	},
	rpcUrls: {
		default: { http: Object.values(rpcUrls[2222]) }
	},
	blockExplorers: {
		default: { name: 'Kava Explorer', url: 'https://explorer.kava.io' }
	},
	testnet: false
};

const metis = {
	id: 1088,
	name: 'Metis',
	network: 'metis',
	iconUrl: chainIconUrl('metis'),
	iconBackground: '#000',
	nativeCurrency: {
		decimals: 18,
		name: 'Metis',
		symbol: 'METIS'
	},
	rpcUrls: {
		default: { http: Object.values(rpcUrls[1088]) }
	},
	blockExplorers: {
		default: { name: 'Metis Explorer', url: 'https://andromeda-explorer.metis.io' }
	},
	testnet: false
};

const pulse = {
	id: 369,
	name: 'PulseChain',
	network: 'pulse',
	iconUrl: chainIconUrl('Pulse'),
	iconBackground: '#000',
	nativeCurrency: {
		decimals: 18,
		name: 'Pulse',
		symbol: 'PLS'
	},
	rpcUrls: {
		default: { http: Object.values(rpcUrls[369]) }
	},
	blockExplorers: {
		default: { name: 'PulseChain Explorer', url: 'https://scan.pulsechain.com' }
	},
	testnet: false
};

const base = {
	id: 8453,
	name: 'Base',
	network: 'base',
	iconUrl: chainIconUrl('Base'),
	iconBackground: '#000',
	nativeCurrency: {
		decimals: 18,
		name: 'Ethereum',
		symbol: 'ETH'
	},
	rpcUrls: {
		default: { http: Object.values(rpcUrls[8453]) }
	},
	blockExplorers: {
		default: { name: 'BaseScan', url: 'https://basescan.org' }
	},
	testnet: false
};

const linea = {
	id: 59144,
	name: 'Linea',
	network: 'linea',
	iconUrl: chainIconUrl('Linea'),
	iconBackground: '#000',
	nativeCurrency: {
		decimals: 18,
		name: 'Ethereum',
		symbol: 'ETH'
	},
	rpcUrls: {
		default: { http: Object.values(rpcUrls[59144]) }
	},
	blockExplorers: {
		default: { name: 'LineaScan', url: 'https://lineascan.build' }
	},
	testnet: false
};

const scroll = {
	id: 534352,
	name: 'Scroll',
	network: 'scroll',
	iconUrl: chainIconUrl('Scroll'),
	iconBackground: '#000',
	nativeCurrency: {
		decimals: 18,
		name: 'Ethereum',
		symbol: 'ETH'
	},
	rpcUrls: {
		default: { http: Object.values(rpcUrls[534352]) }
	},
	blockExplorers: {
		default: { name: 'ScrollScan', url: 'https://scrollscan.com/' }
	},
	testnet: false
};

const sonic = {
	id: 146,
	name: 'Sonic',
	network: 'sonic',
	iconUrl: chainIconUrl('sonic'),
	iconBackground: '#000',
	nativeCurrency: {
		decimals: 18,
		name: 'Sonic',
		symbol: 'S'
	},
	rpcUrls: {
		default: { http: Object.values(rpcUrls[146]) }
	},
	blockExplorers: {
		default: { name: 'SonicScan', url: 'https://sonicscan.org/' }
	},
	testnet: false
};

interface IChain extends Chain {
	network: string;
	iconUrl: string;
	iconBackground: string;
}

export const allChains: Array<IChain> = [
	ethereum,
	arbitrum,
	polygon,
	binance,
	optimism,
	base,
	avax,
	fantom,
	zksync,
	polygonZKEvm,
	linea,
	canto,
	gnosis,
	klaytn,
	aurora,
	cronos,
	celo,
	moonriver,
	heco,
	boba,
	okx,
	// bttc,
	// dogechain,
	moonbeam,
	fuse,
	oasis,
	ontology,
	kava,
	metis,
	pulse,
	velas,
	harmony,
	scroll,
	sonic
];
