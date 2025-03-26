import { uniq } from 'lodash';
import { fallback, http } from 'wagmi';


const ankrApiKey = "8cf34fea798274d63a94fdc1185563307c7a3bd8ef23462364270a73e7d99dce"

export const rpcUrls: Record<number, Record<string, string>> = {
	1: {
		default: 'https://cloudflare-eth.com',
		ankr: `https://rpc.ankr.com/eth/${ankrApiKey}`,
		flashbots: 'https://rpc.flashbots.net',
		builder: 'https://rpc.builder0x69.io',
		publicNode: 'https://ethereum.publicnode.com',
		blastapi: 'https://eth-mainnet.public.blastapi.io'
	},
	56: {
		default: 'https://bsc-dataseed.binance.org',
		defibit: 'https://bsc-dataseed1.defibit.io',
		ankr: `https://rpc.ankr.com/bsc/${ankrApiKey}`,
		ninicoin: 'https://bsc-dataseed1.ninicoin.io',
		defibit2: 'https://bsc-dataseed2.defibit.io',
		ninicoin2: 'https://bsc-dataseed2.ninicoin.io'
	},
	137: {
		default: 'https://rpc-mainnet.matic.quiknode.pro',
		ankr: `https://rpc.ankr.com/polygon/${ankrApiKey}`
	},
	128: {
		default: 'https://http-mainnet.hecochain.com'
	},
	250: {
		default: 'https://rpcapi.fantom.network',
		fantomnetwork2: 'https://rpc2.fantom.network'
	},
	30: {
		default: 'https://public-node.rsk.co'
	},
	88: {
		default: 'https://rpc.tomochain.com'
	},
	100: {
		default: 'https://rpc.gnosischain.com'
	},
	43114: {
		default: 'https://api.avax.network/ext/bc/C/rpc',
		blockpi: 'https://avalanche.blockpi.network/v1/rpc/public',
		blastapi: 'https://ava-mainnet.public.blastapi.io/ext/bc/C/rpc'
	},
	888: {
		default: 'https://gwan-ssl.wandevs.org:56891'
	},
	1666600000: {
		default: 'https://harmony-0-rpc.gateway.pokt.network',
		harmony: 'https://api.harmony.one',
		hmny: 'https://api.s0.t.hmny.io',
		chainstacklabs: 'https://harmony-mainnet.chainstacklabs.com'
	},
	108: {
		default: 'https://mainnet-rpc.thundercore.com'
	},
	66: {
		default: 'https://exchainrpc.okex.org'
	},
	10: {
		default: 'https://mainnet.optimism.io',
		blockpi: 'https://optimism.blockpi.network/v1/rpc/public'
	},
	42161: {
		default: 'https://arb1.arbitrum.io/rpc',
		ankr: `https://rpc.ankr.com/arbitrum/${ankrApiKey}`
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
		default: 'https://arbitrum.xdaichain.com'
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
	57: { default: 'https://rpc.syscoin.org' },
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
	},
	7700: {
		default: 'https://canto.slingshot.finance',
		neobase: 'https://canto.neobase.one',
		plexnode: 'https://mainnode.plexnode.org:8545'
	},
	324: {
		default: 'https://mainnet.era.zksync.io'
	},
	58: {
		default: 'http://dappnode4.ont.io:20339',
		third: 'http://dappnode3.ont.io:20339'
	},
	1101: {
		default: 'https://zkevm-rpc.com'
	},
	2222: {
		default: 'https://evm2.kava.io'
	},
	369: {
		default: 'https://rpc.pulsechain.com'
	},
	8453: {
		default: `https://rpc.ankr.com/base/${ankrApiKey}`,
		publicnode: 'https://base-rpc.publicnode.com',
		third: 'https://base-mainnet.public.blastapi.io'
	},
	59144: {
		default: 'https://rpc.linea.build',
		second: 'https://linea.blockpi.network/v1/rpc/public'
	},
	534352: {
		default: 'https://rpc.scroll.io',
		blastapi: 'https://scroll-mainnet.public.blastapi.io'
	},
	146: {
		default: 'https://rpc.soniclabs.com',
		publicnode: 'https://sonic-rpc.publicnode.com'
	}
};

export const rpcsMap = Object.entries(rpcUrls).reduce(
	(acc, [chainId, rpcs]) => {
		const normalizedRpcs = Object.values(rpcs).reduce(
			(innerAcc, rpc, i) => ({ ...innerAcc, [i === 0 ? 'default' : i]: rpc }),
			{}
		);
		return { ...acc, [chainId]: normalizedRpcs };
	},
	{} as Record<number, Record<number, string>>
);

export const rpcsTransports = Object.fromEntries(
	Object.entries(rpcsMap).map((chain: [string, Record<number, string>]) => [
		chain[0],
		fallback(uniq(Object.values(chain[1])).map((rpc) => http(rpc)))
	])
);
