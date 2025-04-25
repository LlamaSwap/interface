import { Chain } from 'viem';
import { chainIconUrl } from '../Aggregator/nativeTokens';
import { rpcUrls } from '../Aggregator/rpcs';
import * as wagmiChains from 'viem/chains';

const okx = {
	...wagmiChains.okc,
	name: 'OKTChain',
	network: 'okexchain',
	iconUrl: chainIconUrl('oktchain'),
	iconBackground: '#000'
};

const binance = {
	...wagmiChains.bsc,
	name: 'Binance Smart Chain',
	network: 'bsc',
	iconUrl: chainIconUrl('binance'),
	iconBackground: '#000'
};

const boba = {
	...wagmiChains.boba,
	name: 'Boba',
	network: 'boba',
	iconUrl: chainIconUrl('boba'),
	iconBackground: '#000'
};

const harmony = {
	...wagmiChains.harmonyOne,
	name: 'Harmony',
	network: 'harmony',
	iconUrl: chainIconUrl('harmony'),
	iconBackground: '#000'
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
		default: { http: rpcUrls[128] }
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
	...wagmiChains.velas,
	name: 'Velas',
	network: 'velas',
	iconUrl: chainIconUrl('velas'),
	iconBackground: '#000'
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
		default: { http: rpcUrls[42262] }
	},
	blockExplorers: {
		default: { name: 'OasisScan', url: 'https://www.oasisscan.com' }
	},
	testnet: false
};

const moonbeam = {
	...wagmiChains.moonbeam,
	name: 'Moonbeam',
	network: 'moonbeam',
	iconUrl: chainIconUrl('moonbeam'),
	iconBackground: '#000'
};

const fuse = {
	...wagmiChains.fuse,
	name: 'Fuse',
	network: 'fuse',
	iconUrl: chainIconUrl('fuse'),
	iconBackground: '#000'
};

const moonriver = {
	...wagmiChains.moonriver,
	name: 'MoonRiver',
	network: 'moonriver',
	iconUrl: chainIconUrl('moonriver'),
	iconBackground: '#000'
};

const cronos = {
	...wagmiChains.cronos,
	name: 'Cronos',
	network: 'cronos',
	iconUrl: chainIconUrl('cronos'),
	iconBackground: '#000'
};
const celo = {
	...wagmiChains.celo,
	name: 'Celo',
	network: 'celo',
	iconUrl: chainIconUrl('celo'),
	iconBackground: '#000'
};
const aurora = {
	...wagmiChains.aurora,
	name: 'Aurora',
	network: 'aurora',
	iconUrl: chainIconUrl('aurora'),
	iconBackground: '#000'
};
const avax = {
	...wagmiChains.avalanche,
	name: 'AVAX',
	network: 'avax',
	iconUrl: chainIconUrl('avalanche'),
	iconBackground: '#000'
};

const klaytn = {
	...wagmiChains.klaytn,
	name: 'Klaytn',
	network: 'klaytn',
	iconUrl: chainIconUrl('klaytn'),
	iconBackground: '#000'
};
const fantom = {
	...wagmiChains.fantom,
	name: 'Fantom Opera',
	network: 'fantom',
	iconUrl: chainIconUrl('fantom'),
	iconBackground: '#000'
};

const gnosis = {
	...wagmiChains.gnosis,
	name: 'Gnosis',
	network: 'gnosis',
	iconUrl: chainIconUrl('gnosis'),
	iconBackground: '#000'
};
const polygon = {
	...wagmiChains.polygon,
	name: 'Polygon',
	network: 'polygon',
	iconUrl: chainIconUrl('polygon'),
	iconBackground: '#000'
};

const canto = {
	...wagmiChains.canto,
	name: 'Canto',
	network: 'Canto',
	iconUrl: chainIconUrl('canto'),
	iconBackground: '#000'
};

const arbitrum = {
	...wagmiChains.arbitrum,
	name: 'Arbitrum',
	network: 'arbitrum',
	iconUrl: chainIconUrl('arbitrum'),
	iconBackground: '#000'
};

const ethereum = {
	...wagmiChains.mainnet,
	name: 'Ethereum',
	network: 'ethereum',
	iconUrl: chainIconUrl('ethereum'),
	iconBackground: '#000'
};

const optimism = {
	...wagmiChains.optimism,
	name: 'Optimism',
	network: 'optimism',
	iconUrl: chainIconUrl('optimism'),
	iconBackground: '#000'
};

const zksync = {
	...wagmiChains.zksync,
	name: 'zkSync Era',
	network: 'zksync',
	iconUrl: chainIconUrl('zksync era'),
	iconBackground: '#000'
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
		default: { http: rpcUrls[58] }
	},
	blockExplorers: {
		default: { name: 'Ontology Explorer', url: 'https://explorer.ont.io' }
	},
	testnet: false
};

const polygonZKEvm = {
	...wagmiChains.polygonZkEvm,
	name: 'Polygon zkEVM',
	network: 'polygonzkevm',
	iconUrl: chainIconUrl('Polygon zkEVM'),
	iconBackground: '#000'
};

const kava = {
	...wagmiChains.kava,
	name: 'Kava',
	network: 'kava',
	iconUrl: chainIconUrl('Kava'),
	iconBackground: '#000'
};

const metis = {
	...wagmiChains.metis,
	name: 'Metis',
	network: 'metis',
	iconUrl: chainIconUrl('metis'),
	iconBackground: '#000'
};

const pulse = {
	...wagmiChains.pulsechain,
	name: 'PulseChain',
	network: 'pulse',
	iconUrl: chainIconUrl('Pulse'),
	iconBackground: '#000'
};

const base = {
	...wagmiChains.base,
	name: 'Base',
	network: 'base',
	iconUrl: chainIconUrl('Base'),
	iconBackground: '#000'
};

const linea = {
	...wagmiChains.linea,
	name: 'Linea',
	network: 'linea',
	iconUrl: chainIconUrl('Linea'),
	iconBackground: '#000'
};

const scroll = {
	...wagmiChains.scroll,
	name: 'Scroll',
	network: 'scroll',
	iconUrl: chainIconUrl('Scroll'),
	iconBackground: '#000'
};

const sonic = {
	...wagmiChains.sonic,
	name: 'Sonic',
	network: 'sonic',
	iconUrl: chainIconUrl('sonic'),
	iconBackground: '#000'
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
