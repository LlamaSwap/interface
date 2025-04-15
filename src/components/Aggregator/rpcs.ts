import { uniq } from 'lodash';
import { fallback, http } from 'wagmi';

export const rpcUrls: Record<number, Array<string>> = {
	1: [
		'https://cloudflare-eth.com',
		'https://rpc.flashbots.net',
		'https://rpc.builder0x69.io',
		'https://ethereum.publicnode.com',
		'https://eth-mainnet.public.blastapi.io'
	],
	56: [
		'https://bsc-dataseed.binance.org',
		'https://bsc-dataseed1.defibit.io',
		'https://bsc-dataseed1.ninicoin.io',
		'https://bsc-dataseed2.defibit.io',
		'https://bsc-dataseed2.ninicoin.io'
	],
	137: [
		'https://rpc-mainnet.matic.quiknode.pro',
		'https://polygon-rpc.com',
		'https://polygon-bor-rpc.publicnode.com',
		'https://endpoints.omniatech.io/v1/matic/mainnet/public'
	],
	128: ['https://http-mainnet.hecochain.com'],
	250: ['https://rpcapi.fantom.network', 'https://rpc2.fantom.network', 'https://fantom-rpc.publicnode.com'],
	30: ['https://public-node.rsk.co'],
	88: ['https://rpc.tomochain.com'],
	100: ['https://rpc.gnosischain.com', 'https://gnosis-mainnet.public.blastapi.io'],
	43114: [
		'https://api.avax.network/ext/bc/C/rpc',
		'https://ava-mainnet.public.blastapi.io/ext/bc/C/rpc',
		'https://endpoints.omniatech.io/v1/avax/mainnet/public'
	],
	888: ['https://gwan-ssl.wandevs.org:56891'],
	1666600000: [
		'https://harmony-0-rpc.gateway.pokt.network',
		'https://api.harmony.one',
		'https://api.s0.t.hmny.io',
		'https://harmony-mainnet.chainstacklabs.com'
	],
	108: ['https://mainnet-rpc.thundercore.com'],
	66: ['https://exchainrpc.okex.org'],
	10: [
		'https://mainnet.optimism.io',
		'https://optimism-mainnet.public.blastapi.io',
		'https://endpoints.omniatech.io/v1/op/mainnet/public'
	],
	42161: ['https://arb1.arbitrum.io/rpc', 'https://arbitrum-one.public.blastapi.io', 'https://arb1.lava.build'],
	321: ['https://rpc-mainnet.kcc.network'],
	42220: ['https://forno.celo.org'],
	4689: ['https://babel-api.mainnet.iotex.io'],
	1285: ['https://rpc.api.moonriver.moonbeam.network', 'https://moonriver.api.onfinality.io/public'],
	336: [
		'https://evm.shiden.astar.network',
		'https://shiden.api.onfinality.io/public',
		'https://rpc.shiden.astar.network:8545'
	],
	11297108109: ['https://palm-mainnet.infura.io/v3/3a961d6501e54add9a41aa53f15de99b'],
	246: ['https://rpc.energyweb.org'],
	39797: ['https://nodeapi.energi.network'],
	19: ['https://songbird.towolabs.com/rpc'],
	269: ['https://hpbnode.com'],
	60: ['https://rpc.gochain.io'],
	61: ['https://www.ethercluster.com/etc', 'https://blockscout.com/etc/mainnet/api/eth-rpc'],
	200: ['https://arbitrum.xdaichain.com'],
	24: ['https://rpc.kardiachain.io'],
	122: ['https://rpc.fuse.io'],
	10000: ['https://smartbch.fountainhead.cash/mainnet'],
	20: ['https://api.elastos.io/eth', 'https://api.trinity-tech.cn/eth'],
	70: ['https://http-mainnet.hoosmartchain.com'],
	32659: ['https://mainnet.anyswap.exchange'],
	1313161554: ['https://mainnet.aurora.dev'],
	2020: ['https://api.roninchain.com/rpc'],
	288: ['https://mainnet.boba.network'],
	25: [
		'https://cronosrpc-1.xstaking.sg',
		'https://evm.cronos.org',
		'https://rpc.vvs.finance',
		'https://evm-cronos.crypto.org'
	],
	333999: ['https://rpc.polis.tech'],
	55: [
		'https://rpc-1.zyx.network',
		'https://rpc-2.zyx.network',
		'https://rpc-2.zyx.network',
		'https://rpc-5.zyx.network'
	],
	40: ['https://mainnet.telos.net/evm', 'https://rpc1.eu.telos.net/evm', 'https://rpc1.us.telos.net/evm'],
	1088: ['https://andromeda.metis.io/?owner=1088'],
	8: ['https://rpc.octano.dev'],
	106: ['https://evmexplorer.velas.com/rpc'],
	820: ['https://rpc.callisto.network', 'https://clo-geth.0xinfra.com'],
	8217: ['https://public-node-api.klaytnapi.com/v1/cypress'],
	52: [
		'https://rpc.coinex.net',
		'https://rpc1.coinex.net',
		'https://rpc2.coinex.net',
		'https://rpc3.coinex.net',
		'https://rpc4.coinex.net'
	],
	5551: ['https://l2.nahmii.io'],
	5050: ['https://rpc.liquidchain.net', 'https://rpc.xlcscan.com'],
	82: ['https://rpc.meter.io'],
	361: ['https://eth-rpc-api.thetatoken.org/rpc'],
	42262: ['https://emerald.oasis.dev'],
	57: ['https://rpc.syscoin.org'],
	1284: ['https://rpc.api.moonbeam.network'],
	836542336838601: ['https://mainnet-api.skalenodes.com/v1/fit-betelgeuse'],
	592: ['https://evm.astar.network', 'https://rpc.astar.network:8545', 'https://astar.api.onfinality.io/public'],
	7700: ['https://canto.slingshot.finance', 'https://canto.neobase.one', 'https://mainnode.plexnode.org:8545'],
	324: ['https://mainnet.era.zksync.io'],
	58: ['http://dappnode4.ont.io:20339', 'http://dappnode3.ont.io:20339'],
	1101: ['https://zkevm-rpc.com'],
	2222: ['https://evm2.kava.io'],
	369: ['https://rpc.pulsechain.com'],
	8453: ['https://mainnet.base.org', 'https://base-rpc.publicnode.com', 'https://base-mainnet.public.blastapi.io'],
	59144: ['https://rpc.linea.build'],
	534352: ['https://rpc.scroll.io', 'https://scroll-mainnet.public.blastapi.io'],
	146: ['https://rpc.soniclabs.com', 'https://sonic-rpc.publicnode.com']
};

export const rpcsTransports = Object.fromEntries(
	Object.entries(rpcUrls).map((chain: [string, Array<string>]) => [
		chain[0],
		fallback(uniq(chain[1]).map((rpc) => http(rpc, { timeout: 3_000 })))
	])
);
