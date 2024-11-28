export const AUTH_HEADER = process.env.INCH_API_KEY ? { 'auth-key': process.env.INCH_API_KEY } : {};

export const NATIVE_TOKEN = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

export const CHAIN_TO_ID = {
	ethereum: 1,
	bsc: 56,
	polygon: 137,
	optimism: 10,
	arbitrum: 42161,
	gnosis: 100,
	avax: 43114,
	fantom: 250,
	klaytn: 8217,
	aurora: 1313161554,
	zksync: 324,
	base: 8453
};

export const SPENDERS = {
	ethereum: '0x111111125421ca6dc452d289314280a0f8842a65',
	bsc: '0x111111125421ca6dc452d289314280a0f8842a65',
	polygon: '0x111111125421ca6dc452d289314280a0f8842a65',
	optimism: '0x111111125421ca6dc452d289314280a0f8842a65',
	arbitrum: '0x111111125421ca6dc452d289314280a0f8842a65',
	gnosis: '0x111111125421ca6dc452d289314280a0f8842a65',
	avax: '0x111111125421ca6dc452d289314280a0f8842a65',
	fantom: '0x111111125421ca6dc452d289314280a0f8842a65',
	klaytn: '0x111111125421ca6dc452d289314280a0f8842a65',
	aurora: '0x111111125421ca6dc452d289314280a0f8842a65',
	zksync: '0x6fd4383cb451173d5f9304f041c7bcbf27d561ff',
	base: '0x111111125421ca6dc452d289314280a0f8842a65'
};

export const AVAILABLE_CHAINS_FOR_FUSION = new Set<number>([
	CHAIN_TO_ID.ethereum,
	CHAIN_TO_ID.bsc,
	CHAIN_TO_ID.polygon,
	CHAIN_TO_ID.optimism,
	CHAIN_TO_ID.arbitrum,
	CHAIN_TO_ID.gnosis,
	CHAIN_TO_ID.avax,
	CHAIN_TO_ID.fantom,
	CHAIN_TO_ID.zksync,
	CHAIN_TO_ID.base,
]);
