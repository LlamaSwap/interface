import { uniq } from 'lodash';
import { fallback, http } from 'wagmi';


const LLAMA_RPC = 'https://rpc-aggregator-worker.0xngmi.workers.dev'

export const rpcUrls: Record<number, Array<string>> = {
	1: [
		`${LLAMA_RPC}/ethereum`,
		'https://cloudflare-eth.com',
		'https://rpc.flashbots.net',
		'https://rpc.builder0x69.io',
		'https://ethereum.publicnode.com',
		'https://eth-mainnet.public.blastapi.io'
	],
	56: [
		`${LLAMA_RPC}/bsc`,
		'https://bsc-dataseed.binance.org',
		'https://bsc-dataseed1.defibit.io',
		'https://bsc-dataseed1.ninicoin.io',
		'https://bsc-dataseed2.defibit.io',
		'https://bsc-dataseed2.ninicoin.io'
	],
	137: [
		`${LLAMA_RPC}/polygon`,
		'https://rpc-mainnet.matic.quiknode.pro',
		'https://polygon-rpc.com',
		'https://polygon-bor-rpc.publicnode.com',
		'https://endpoints.omniatech.io/v1/matic/mainnet/public'
	],
	128: [`${LLAMA_RPC}/heco`, 'https://http-mainnet.hecochain.com'],
	250: [`${LLAMA_RPC}/fantom`, 'https://rpcapi.fantom.network', 'https://rpc2.fantom.network', 'https://fantom-rpc.publicnode.com'],
	30: [`${LLAMA_RPC}/rsk`, 'https://public-node.rsk.co'],
	88: [`${LLAMA_RPC}/tomochain`, 'https://rpc.tomochain.com'],
	100: [`${LLAMA_RPC}/xdai`, 'https://rpc.gnosischain.com', 'https://gnosis-mainnet.public.blastapi.io'],
	43114: [
		`${LLAMA_RPC}/avax`,
		'https://api.avax.network/ext/bc/C/rpc',
		'https://ava-mainnet.public.blastapi.io/ext/bc/C/rpc',
		'https://endpoints.omniatech.io/v1/avax/mainnet/public'
	],
	888: [`${LLAMA_RPC}/wan`, 'https://gwan-ssl.wandevs.org:56891'],
	1666600000: [
		`${LLAMA_RPC}/harmony`,
		'https://harmony-0-rpc.gateway.pokt.network',
		'https://api.harmony.one',
		'https://api.s0.t.hmny.io',
		'https://harmony-mainnet.chainstacklabs.com'
	],
	108: [`${LLAMA_RPC}/thundercore`, 'https://mainnet-rpc.thundercore.com'],
	66: [`${LLAMA_RPC}/okexchain`, 'https://exchainrpc.okex.org'],
	10: [
		`${LLAMA_RPC}/optimism`,
		'https://mainnet.optimism.io',
		'https://optimism-mainnet.public.blastapi.io',
		'https://endpoints.omniatech.io/v1/op/mainnet/public'
	],
	42161: [
		`${LLAMA_RPC}/arbitrum`,
		'https://arb1.arbitrum.io/rpc',
		'https://arbitrum-one.public.blastapi.io',
		'https://arb1.lava.build'
	],
	321: [`${LLAMA_RPC}/kcc`, 'https://rpc-mainnet.kcc.network'],
	42220: [`${LLAMA_RPC}/celo`, 'https://forno.celo.org'],
	4689: [`${LLAMA_RPC}/iotex`, 'https://babel-api.mainnet.iotex.io'],
	1285: [`${LLAMA_RPC}/moonriver`, 'https://rpc.api.moonriver.moonbeam.network', 'https://moonriver.api.onfinality.io/public'],
	336: [
		`${LLAMA_RPC}/shiden`,
		'https://shiden.api.onfinality.io/public',
		'https://rpc.shiden.astar.network:8545'
	],
	11297108109: [`${LLAMA_RPC}/palm`, 'https://palm-mainnet.infura.io/v3/3a961d6501e54add9a41aa53f15de99b'],
	246: [`${LLAMA_RPC}/energyweb`, 'https://rpc.energyweb.org'],
	39797: [`${LLAMA_RPC}/energi`, 'https://nodeapi.energi.network'],
	19: [`${LLAMA_RPC}/songbird`, 'https://songbird.towolabs.com/rpc'],
	269: [`${LLAMA_RPC}/hpb`, 'https://hpbnode.com'],
	60: [`${LLAMA_RPC}/gochain`, 'https://rpc.gochain.io'],
	61: [`${LLAMA_RPC}/ethereumclassic`, 'https://www.ethercluster.com/etc', 'https://blockscout.com/etc/mainnet/api/eth-rpc'],
	200: [`${LLAMA_RPC}/xdaiarb`, 'https://arbitrum.xdaichain.com'],
	24: [`${LLAMA_RPC}/kardia`, 'https://rpc.kardiachain.io'],
	122: [`${LLAMA_RPC}/fuse`, 'https://rpc.fuse.io'],
	10000: [`${LLAMA_RPC}/smartbch`, 'https://smartbch.fountainhead.cash/mainnet'],
	20: [`${LLAMA_RPC}/elastos`, 'https://api.elastos.io/eth', 'https://api.trinity-tech.cn/eth'],
	70: [`${LLAMA_RPC}/hoo`, 'https://http-mainnet.hoosmartchain.com'],
	32659: [`${LLAMA_RPC}/fusion`, 'https://mainnet.anyswap.exchange'],
	1313161554: [`${LLAMA_RPC}/aurora`, 'https://mainnet.aurora.dev'],
	2020: [`${LLAMA_RPC}/ronin`, 'https://api.roninchain.com/rpc'],
	288: [`${LLAMA_RPC}/boba`, 'https://mainnet.boba.network'],
	25: [
		`${LLAMA_RPC}/cronos`,
		'https://cronosrpc-1.xstaking.sg',
		'https://evm.cronos.org',
		'https://rpc.vvs.finance',
		'https://evm-cronos.crypto.org'
	],
	333999: [`${LLAMA_RPC}/polis`, 'https://rpc.polis.tech'],
	55: [
		`${LLAMA_RPC}/zyx`,
		'https://rpc-1.zyx.network',
		'https://rpc-2.zyx.network',
		'https://rpc-2.zyx.network',
		'https://rpc-5.zyx.network'
	],
	40: [`${LLAMA_RPC}/telos`, 'https://mainnet.telos.net/evm', 'https://rpc1.eu.telos.net/evm', 'https://rpc1.us.telos.net/evm'],
	1088: [`${LLAMA_RPC}/metis`, 'https://andromeda.metis.io/?owner=1088'],
	8: [`${LLAMA_RPC}/ubiq`, 'https://rpc.octano.dev'],
	106: [`${LLAMA_RPC}/velas`, 'https://evmexplorer.velas.com/rpc'],
	820: [`${LLAMA_RPC}/callisto`, 'https://rpc.callisto.network', 'https://clo-geth.0xinfra.com'],
	8217: [`${LLAMA_RPC}/klaytn`, 'https://public-node-api.klaytnapi.com/v1/cypress'],
	52: [
		`${LLAMA_RPC}/csc`,
		'https://rpc.coinex.net',
		'https://rpc1.coinex.net',
		'https://rpc2.coinex.net',
		'https://rpc3.coinex.net',
		'https://rpc4.coinex.net'
	],
	5551: [`${LLAMA_RPC}/nahmii`, 'https://l2.nahmii.io'],
	5050: [`${LLAMA_RPC}/liquidchain`, 'https://rpc.liquidchain.net', 'https://rpc.xlcscan.com'],
	82: [`${LLAMA_RPC}/meter`, 'https://rpc.meter.io'],
	361: [`${LLAMA_RPC}/theta`, 'https://eth-rpc-api.thetatoken.org/rpc'],
	42262: [`${LLAMA_RPC}/oasis`, 'https://emerald.oasis.dev'],
	57: [`${LLAMA_RPC}/syscoin`, 'https://rpc.syscoin.org'],
	1284: [`${LLAMA_RPC}/moonbeam`, 'https://rpc.api.moonbeam.network'],
	836542336838601: [`${LLAMA_RPC}/curio`, 'https://mainnet-api.skalenodes.com/v1/fit-betelgeuse'],
	592: [`${LLAMA_RPC}/astar`, 'https://evm.astar.network', 'https://rpc.astar.network:8545', 'https://astar.api.onfinality.io/public'],
	7700: [`${LLAMA_RPC}/canto`, 'https://canto.slingshot.finance', 'https://canto.neobase.one', 'https://mainnode.plexnode.org:8545'],
	324: [`${LLAMA_RPC}/era`, 'https://mainnet.era.zksync.io'],
	58: [`${LLAMA_RPC}/ontology_evm`, 'http://dappnode4.ont.io:20339', 'http://dappnode3.ont.io:20339'],
	1101: [`${LLAMA_RPC}/polygon_zkevm`, 'https://zkevm-rpc.com'],
	2222: [`${LLAMA_RPC}/kava`, 'https://evm2.kava.io'],
	369: [`${LLAMA_RPC}/pulse`, 'https://rpc.pulsechain.com'],
	8453: [`${LLAMA_RPC}/base`, 'https://mainnet.base.org', 'https://base-rpc.publicnode.com', 'https://base-mainnet.public.blastapi.io'],
	59144: [`${LLAMA_RPC}/linea`, 'https://rpc.linea.build'],
	534352: [`${LLAMA_RPC}/scroll`, 'https://rpc.scroll.io', 'https://scroll-mainnet.public.blastapi.io'],
	146: [`${LLAMA_RPC}/sonic`, 'https://rpc.soniclabs.com', 'https://sonic-rpc.publicnode.com']
};

export const rpcsTransports = Object.fromEntries(
	Object.entries(rpcUrls).map((chain: [string, Array<string>]) => [
		chain[0],
		fallback(uniq(chain[1]).map((rpc) => http(rpc, { timeout: 3_000 })))
	])
);
