import { geckoTerminalChainsMap } from '~/components/Aggregator/constants';

export async function getTokenList() {
	return fetch(`http://llama-tokenlists.s3-website.eu-central-1.amazonaws.com/tokenlists.json`).then((r) => r.json());
}

export const getTopTokensByChain = async (chainId) => {
	try {
		if (!geckoTerminalChainsMap[chainId]) {
			return [chainId, []];
		}

		const resData = [];
		const resIncluded = [];

		let prevRes = await fetch(
			`https://app.geckoterminal.com/api/p1/${geckoTerminalChainsMap[chainId]}/pools?include=dex%2Cdex.network%2Cdex.network.network_metric%2Ctokens&page=1&include_network_metrics=true`
		).then((res) => res.json());

		for (let i = 0; i < 5; i++) {
			if (prevRes?.links?.next) {
				prevRes = await fetch(prevRes?.links?.next).then((r) => r.json());
				resData.push(...prevRes?.data);
				resIncluded.push(...prevRes?.included);
			}
		}

		const result = resData.map((pool) => {
			const token0Id = pool?.relationships?.tokens?.data[0]?.id;
			const token1Id = pool?.relationships?.tokens?.data[1]?.id;

			const token0 = resIncluded?.find((item) => item?.id === token0Id)?.attributes || {};
			const token1 = resIncluded?.find((item) => item?.id === token1Id)?.attributes || {};

			return { ...pool, token0, token1 };
		});

		return [chainId, result || []];
	} catch (error) {
		return [chainId, []];
	}
};
