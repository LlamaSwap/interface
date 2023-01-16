import { ethers } from 'ethers';

function createProvider(name: string, defaultRpc: string, chainId: number) {
	if (process.env.HISTORICAL) {
		if (chainId === 1) {
			console.log('RPC providers set to historical, only the first RPC provider will be used');
		}
		return new ethers.providers.StaticJsonRpcProvider(
			(process.env[name.toUpperCase() + '_RPC'] ?? defaultRpc)?.split(',')[0],
			{
				name,
				chainId
			}
		);
	} else {
		return new ethers.providers.FallbackProvider(
			(process.env[name.toUpperCase() + '_RPC'] ?? defaultRpc).split(',').map((url, i) => ({
				provider: new ethers.providers.StaticJsonRpcProvider(url, {
					name,
					chainId
				}),
				priority: i
			})),
			1
		);
	}
}

export const rpcUrls = {
	1: {
		default: 'https://rpc.ankr.com/eth',
		pokt: 'https://eth-mainnet.gateway.pokt.network/v1/5f3453978e354ab992c4da79',
		cloudflare: 'https://cloudflare-eth.com',
		linkpool: 'https://main-light.eth.linkpool.io',
		mycryptoapi: 'https://api.mycryptoapi.com/eth'
	},
	56: {
		default: 'https://bsc-dataseed.binance.org',
		defibit: 'https://bsc-dataseed1.defibit.io',
		ninicoin: 'https://bsc-dataseed1.ninicoin.io',
		defibit2: 'https://bsc-dataseed2.defibit.io',
		ninicoin2: 'https://bsc-dataseed2.ninicoin.io'
	},
	137: {
		default: 'https://polygon-rpc.com',
		llama: 'https://polygon.llamarpc.com',
		maticvigil: 'https://rpc-mainnet.maticvigil.com'
	},
	128: {
		default: 'https://http-mainnet.hecochain.com'
	},
	250: {
		default: 'https://rpc.ankr.com/fantom',
		ftmtools: 'https://rpc.ftm.tools',
		fantomnetwork: 'https://rpcapi.fantom.network'
	},
	30: {
		default: 'https://public-node.rsk.co'
	},
	88: {
		default: 'https://rpc.tomochain.com'
	},
	100: {
		default: 'https://rpc.ankr.com/gnosis',
		blockscout: 'https://xdai-archive.blockscout.com'
	},
	43114: {
		default: 'https://api.avax.network/ext/bc/C/rpc',
		ankr: 'https://rpc.ankr.com/avalanche'
	},
	888: {
		default: 'https://gwan-ssl.wandevs.org:56891'
	},
	1666600000: {
		default: 'https://harmony-0-rpc.gateway.pokt.network',
		harmony: 'https://api.harmony.one',
		hmny: 'https://api.s0.t.hmny.io'
	},
	108: {
		default: 'https://mainnet-rpc.thundercore.com'
	},
	66: {
		default: 'https://exchainrpc.okex.org'
	},
	10: {
		default: 'https://opt-mainnet.g.alchemy.com/v2/CMDWPZtTF2IsTOH0TE-8WNm8CTjPWz1H'
	},
	42161: {
		default: 'https://arb1.arbitrum.io/rpc'
	},
	321: {
		default: 'https://rpc-mainnet.kcc.network'
	},
	42220: {
		default: 'https://forno.celo.org'
	},
	4689: {
		default: 'https://babel-api.mainnet.iotex.io'
	},
	1285: {
		default: 'https://rpc.api.moonriver.moonbeam.network',
		onfinality: 'https://moonriver.api.onfinality.io/public'
	},
	336: {
		default: 'https://evm.shiden.astar.network',
		onfinality: 'https://shiden.api.onfinality.io/public',
		astar: 'https://rpc.shiden.astar.network:8545'
	},
	11297108109: {
		default: 'https://palm-mainnet.infura.io/v3/3a961d6501e54add9a41aa53f15de99b'
	},
	246: {
		default: 'https://rpc.energyweb.org'
	},
	39797: {
		default: 'https://nodeapi.energi.network'
	},
	19: {
		default: 'https://songbird.towolabs.com/rpc'
	},
	269: {
		default: 'https://hpbnode.com'
	},
	60: {
		default: 'https://rpc.gochain.io'
	},
	61: {
		default: 'https://www.ethercluster.com/etc',
		blockscout: 'https://blockscout.com/etc/mainnet/api/eth-rpc'
	},
	200: {
		default: '200'
	},
	24: {
		default: 'https://rpc.kardiachain.io'
	},
	122: {
		default: 'https://rpc.fuse.io'
	},
	10000: {
		default: 'https://smartbch.fountainhead.cash/mainnet'
	},
	20: {
		default: 'https://api.elastos.io/eth',
		trinity: 'https://api.trinity-tech.cn/eth'
	},
	70: {
		default: 'https://http-mainnet.hoosmartchain.com'
	},
	32659: { default: 'https://mainnet.anyswap.exchange,https://mainway.freemoon.xyz/gate' },
	1313161554: { default: 'https://mainnet.aurora.dev' },
	2020: {
		default: 'https://api.roninchain.com/rpc'
	},
	288: {
		default: 'https://mainnet.boba.network'
	},
	25: {
		default: 'https://cronosrpc-1.xstaking.sg',
		cronosorg: 'https://evm.cronos.org',
		vvs: 'https://rpc.vvs.finance',
		cryptoorg: 'https://evm-cronos.crypto.org'
	},
	333999: {
		default: 'https://rpc.polis.tech'
	},
	55: {
		default: 'https://rpc-1.zyx.network',
		zyx2: 'https://rpc-2.zyx.network',
		zyx3: 'https://rpc-2.zyx.network',
		zyx5: 'https://rpc-5.zyx.network'
	},
	40: {
		default: 'https://mainnet.telos.net/evm',
		teloseu: 'https://rpc1.eu.telos.net/evm',
		telosus: 'https://rpc1.us.telos.net/evm'
	},
	1088: {
		default: 'https://andromeda.metis.io/?owner=1088'
	},
	8: { default: 'https://rpc.octano.dev' },
	106: {
		default: 'https://evmexplorer.velas.com/rpc'
	},
	820: {
		default: 'https://rpc.callisto.network',
		zerox: 'https://clo-geth.0xinfra.com'
	},
	8217: { default: 'https://public-node-api.klaytnapi.com/v1/cypress' },
	52: {
		default: 'https://rpc.coinex.net',
		coinex1: 'https://rpc1.coinex.net',
		coinex2: 'https://rpc2.coinex.net',
		coinex3: 'https://rpc3.coinex.net',
		coinex4: 'https://rpc4.coinex.net'
	},
	5551: {
		default: 'https://l2.nahmii.io'
	},
	5050: { default: 'https://rpc.liquidchain.net', xlc: 'https://rpc.xlcscan.com' },
	82: {
		default: 'https://rpc.meter.io'
	},
	361: {
		default: 'https://eth-rpc-api.thetatoken.org/rpc'
	},
	42262: { default: 'https://emerald.oasis.dev' },
	57: { default: 'https://rpc.ankr.com/syscoin', sys: 'https://rpc.syscoin.org' },
	1284: {
		default: 'https://rpc.api.moonbeam.network'
	},
	836542336838601: {
		default: 'https://mainnet-api.skalenodes.com/v1/fit-betelgeuse'
	},
	592: {
		default: 'https://evm.astar.network',
		astar1: 'https://rpc.astar.network:8545',
		astar2: 'https://astar.api.onfinality.io/public'
	}
};

const getUrls = (chainId: keyof typeof rpcUrls) => Object.values(rpcUrls[chainId]).join(',');

export const providers = {
	ethereum: createProvider('ethereum', getUrls(1), 1),
	bsc: createProvider('bsc', getUrls(56), 56),
	polygon: createProvider('polygon', getUrls(137), 137),
	heco: createProvider('heco', getUrls(128), 128),
	fantom: createProvider('fantom', getUrls(250), 250),
	rsk: createProvider('rsk', getUrls(30), 30),
	tomochain: createProvider('tomochain', getUrls(88), 88),
	xdai: createProvider('xdai', getUrls(100), 100),
	avax: createProvider('avax', getUrls(43114), 43114),
	wan: createProvider('wan', getUrls(888), 888),
	harmony: createProvider('harmony', getUrls(1666600000), 1666600000),
	thundercore: createProvider('thundercore', getUrls(108), 108),
	okexchain: createProvider('okexchain', getUrls(66), 66),
	optimism: createProvider('optimism', getUrls(10), 10),
	arbitrum: createProvider('arbitrum', getUrls(42161), 42161),
	kcc: createProvider('kcc', getUrls(321), 321),
	celo: createProvider('celo', getUrls(42220), 42220),
	iotex: createProvider('iotex', getUrls(4689), 4689),
	moonriver: createProvider('moonriver', getUrls(1285), 1285),
	shiden: createProvider('shiden', getUrls(336), 336),
	palm: createProvider('palm', getUrls(11297108109), 11297108109),
	energyweb: createProvider('energyweb', getUrls(246), 246),
	energi: createProvider('energi', getUrls(39797), 39797),
	songbird: createProvider('songbird', getUrls(19), 19),
	hpb: createProvider('hpb', getUrls(269), 269),
	gochain: createProvider('gochain', getUrls(60), 60),
	ethereumclassic: createProvider('ethereumclassic', getUrls(61), 61),
	xdaiarb: createProvider('xdaiarb', getUrls(200), 200),
	kardia: createProvider('kardia', getUrls(24), 24),
	fuse: createProvider('fuse', getUrls(122), 122),
	smartbch: createProvider('smartbch', getUrls(10000), 10000),
	elastos: createProvider('elastos', getUrls(20), 20),
	hoo: createProvider('hoo', getUrls(70), 70),
	fusion: createProvider('fusion', getUrls(32659), 32659),
	aurora: createProvider('aurora', getUrls(1313161554), 1313161554),
	ronin: createProvider('ronin', getUrls(2020), 2020),
	boba: createProvider('boba', getUrls(288), 288),
	cronos: createProvider('cronos', getUrls(25), 25),
	polis: createProvider('polis', getUrls(333999), 333999),
	zyx: createProvider('zyx', getUrls(55), 55),
	telos: createProvider('telos', getUrls(40), 40),
	metis: createProvider('metis', getUrls(1088), 1088),
	ubiq: createProvider('ubiq', getUrls(8), 8),
	velas: createProvider('velas', getUrls(106), 106),
	callisto: createProvider('callisto', getUrls(820), 820),
	klaytn: createProvider('klaytn', getUrls(8217), 8217),
	csc: createProvider('csc', getUrls(52), 52),
	nahmii: createProvider('nahmii', getUrls(5551), 5551),
	liquidchain: createProvider('xlc', getUrls(5050), 5050),
	meter: createProvider('meter', getUrls(82), 82),
	theta: createProvider('theta', getUrls(361), 361),
	oasis: createProvider('oasis', getUrls(42262), 42262),
	syscoin: createProvider('syscoin', getUrls(57), 57),
	moonbeam: createProvider('moonbeam', getUrls(1284), 1284),
	curio: createProvider('curio', getUrls(836542336838601), 836542336838601),
	astar: createProvider('astar', getUrls(592), 592)
};
