import { uniq } from 'lodash';
import { fallback, http } from 'wagmi';


const getLlamaRpc = (chain:string) => `https://rpc.llama-rpc.com/${chain}?source=llamaswap`

export const rpcUrls: Record<number, Array<string>> = {
	1: [
		getLlamaRpc("ethereum"),
		'https://cloudflare-eth.com',
		'https://rpc.flashbots.net',
		'https://rpc.builder0x69.io',
		'https://ethereum.publicnode.com',
		'https://eth-mainnet.public.blastapi.io'
	],
	56: [
		getLlamaRpc("bsc"),
		'https://bsc-dataseed.binance.org',
		'https://bsc-dataseed1.defibit.io',
		'https://bsc-dataseed1.ninicoin.io',
		'https://bsc-dataseed2.defibit.io',
		'https://bsc-dataseed2.ninicoin.io'
	],
	137: [
		getLlamaRpc("polygon"),
		'https://rpc-mainnet.matic.quiknode.pro',
		'https://polygon-rpc.com',
		'https://polygon-bor-rpc.publicnode.com',
		'https://endpoints.omniatech.io/v1/matic/mainnet/public'
	],
	128: [getLlamaRpc("heco"), 'https://http-mainnet.hecochain.com'],
	250: [getLlamaRpc("fantom"), 'https://rpcapi.fantom.network', 'https://rpc2.fantom.network', 'https://fantom-rpc.publicnode.com'],
	30: [getLlamaRpc("rsk"), 'https://public-node.rsk.co'],
	88: [getLlamaRpc("tomochain"), 'https://rpc.tomochain.com'],
	100: [getLlamaRpc("xdai"), 'https://rpc.gnosischain.com', 'https://gnosis-mainnet.public.blastapi.io'],
	43114: [
		getLlamaRpc("avax"),
		'https://api.avax.network/ext/bc/C/rpc',
		'https://ava-mainnet.public.blastapi.io/ext/bc/C/rpc',
		'https://endpoints.omniatech.io/v1/avax/mainnet/public'
	],
	888: [getLlamaRpc("wan"), 'https://gwan-ssl.wandevs.org:56891'],
	1666600000: [
		getLlamaRpc("harmony"),
		'https://harmony-0-rpc.gateway.pokt.network',
		'https://api.harmony.one',
		'https://api.s0.t.hmny.io',
		'https://harmony-mainnet.chainstacklabs.com'
	],
	108: [getLlamaRpc("thundercore"), 'https://mainnet-rpc.thundercore.com'],
	66: [getLlamaRpc("okexchain"), 'https://exchainrpc.okex.org'],
	10: [
		getLlamaRpc("optimism"),
		'https://mainnet.optimism.io',
		'https://optimism-mainnet.public.blastapi.io',
		'https://endpoints.omniatech.io/v1/op/mainnet/public'
	],
	42161: [
		getLlamaRpc("arbitrum"),
		'https://arb1.arbitrum.io/rpc',
		'https://arbitrum-one.public.blastapi.io',
		'https://arb1.lava.build'
	],
	321: [getLlamaRpc("kcc"), 'https://rpc-mainnet.kcc.network'],
	42220: [getLlamaRpc("celo"), 'https://forno.celo.org'],
	4689: [getLlamaRpc("iotex"), 'https://babel-api.mainnet.iotex.io'],
	1285: [getLlamaRpc("moonriver"), 'https://rpc.api.moonriver.moonbeam.network', 'https://moonriver.api.onfinality.io/public'],
	336: [
		getLlamaRpc("shiden"),
		'https://shiden.api.onfinality.io/public',
		'https://rpc.shiden.astar.network:8545'
	],
	11297108109: [getLlamaRpc("palm"), 'https://palm-mainnet.infura.io/v3/3a961d6501e54add9a41aa53f15de99b'],
	246: [getLlamaRpc("energyweb"), 'https://rpc.energyweb.org'],
	39797: [getLlamaRpc("energi"), 'https://nodeapi.energi.network'],
	19: [getLlamaRpc("songbird"), 'https://songbird.towolabs.com/rpc'],
	269: [getLlamaRpc("hpb"), 'https://hpbnode.com'],
	60: [getLlamaRpc("gochain"), 'https://rpc.gochain.io'],
	61: [getLlamaRpc("ethereumclassic"), 'https://www.ethercluster.com/etc', 'https://blockscout.com/etc/mainnet/api/eth-rpc'],
	200: [getLlamaRpc("xdaiarb"), 'https://arbitrum.xdaichain.com'],
	24: [getLlamaRpc("kardia"), 'https://rpc.kardiachain.io'],
	122: [getLlamaRpc("fuse"), 'https://rpc.fuse.io'],
	10000: [getLlamaRpc("smartbch"), 'https://smartbch.fountainhead.cash/mainnet'],
	20: [getLlamaRpc("elastos"), 'https://api.elastos.io/eth', 'https://api.trinity-tech.cn/eth'],
	70: [getLlamaRpc("hoo"), 'https://http-mainnet.hoosmartchain.com'],
	32659: [getLlamaRpc("fusion"), 'https://mainnet.anyswap.exchange'],
	1313161554: [getLlamaRpc("aurora"), 'https://mainnet.aurora.dev'],
	2020: [getLlamaRpc("ronin"), 'https://api.roninchain.com/rpc'],
	288: [getLlamaRpc("boba"), 'https://mainnet.boba.network'],
	25: [
		getLlamaRpc("cronos"),
		'https://cronosrpc-1.xstaking.sg',
		'https://evm.cronos.org',
		'https://rpc.vvs.finance',
		'https://evm-cronos.crypto.org'
	],
	333999: [getLlamaRpc("polis"), 'https://rpc.polis.tech'],
	55: [
		getLlamaRpc("zyx"),
		'https://rpc-1.zyx.network',
		'https://rpc-2.zyx.network',
		'https://rpc-2.zyx.network',
		'https://rpc-5.zyx.network'
	],
	40: [getLlamaRpc("telos"), 'https://mainnet.telos.net/evm', 'https://rpc1.eu.telos.net/evm', 'https://rpc1.us.telos.net/evm'],
	1088: [getLlamaRpc("metis"), 'https://andromeda.metis.io/?owner=1088'],
	8: [getLlamaRpc("ubiq"), 'https://rpc.octano.dev'],
	106: [getLlamaRpc("velas"), 'https://evmexplorer.velas.com/rpc'],
	820: [getLlamaRpc("callisto"), 'https://rpc.callisto.network', 'https://clo-geth.0xinfra.com'],
	8217: [getLlamaRpc("klaytn"), 'https://public-node-api.klaytnapi.com/v1/cypress'],
	52: [
		getLlamaRpc("csc"),
		'https://rpc.coinex.net',
		'https://rpc1.coinex.net',
		'https://rpc2.coinex.net',
		'https://rpc3.coinex.net',
		'https://rpc4.coinex.net'
	],
	5551: [getLlamaRpc("nahmii"), 'https://l2.nahmii.io'],
	5050: [getLlamaRpc("liquidchain"), 'https://rpc.liquidchain.net', 'https://rpc.xlcscan.com'],
	82: [getLlamaRpc("meter"), 'https://rpc.meter.io'],
	361: [getLlamaRpc("theta"), 'https://eth-rpc-api.thetatoken.org/rpc'],
	42262: [getLlamaRpc("oasis"), 'https://emerald.oasis.dev'],
	57: [getLlamaRpc("syscoin"), 'https://rpc.syscoin.org'],
	1284: [getLlamaRpc("moonbeam"), 'https://rpc.api.moonbeam.network'],
	836542336838601: [getLlamaRpc("curio"), 'https://mainnet-api.skalenodes.com/v1/fit-betelgeuse'],
	592: [getLlamaRpc("astar"), 'https://evm.astar.network', 'https://rpc.astar.network:8545', 'https://astar.api.onfinality.io/public'],
	7700: [getLlamaRpc("canto"), 'https://canto.slingshot.finance', 'https://canto.neobase.one', 'https://mainnode.plexnode.org:8545'],
	324: [getLlamaRpc("era"), 'https://mainnet.era.zksync.io'],
	58: [getLlamaRpc("ontology_evm"), 'http://dappnode4.ont.io:20339', 'http://dappnode3.ont.io:20339'],
	1101: [getLlamaRpc("polygon_zkevm"), 'https://zkevm-rpc.com'],
	2222: [getLlamaRpc("kava"), 'https://evm2.kava.io'],
	369: [getLlamaRpc("pulse"), 'https://rpc.pulsechain.com'],
	8453: [getLlamaRpc("base"), 'https://mainnet.base.org', 'https://base-rpc.publicnode.com', 'https://base-mainnet.public.blastapi.io'],
	59144: [getLlamaRpc("linea"), 'https://rpc.linea.build'],
	534352: [getLlamaRpc("scroll"), 'https://rpc.scroll.io', 'https://scroll-mainnet.public.blastapi.io'],
	146: [getLlamaRpc("sonic"), 'https://rpc.soniclabs.com', 'https://sonic-rpc.publicnode.com']
};

export const rpcsTransports = Object.fromEntries(
	Object.entries(rpcUrls).map((chain: [string, Array<string>]) => [
		chain[0],
		fallback(uniq(chain[1]).map((rpc) => http(rpc, { timeout: 3_000 })))
	])
);
