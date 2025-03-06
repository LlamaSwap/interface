import { geckoTerminalChainsMap } from '~/components/Aggregator/constants';

export async function getTokenList() {
	return fetch(`https://d3g10bzo9rdluh.cloudfront.net/tokenlists.json`).then((r) => r.json());
}
export const getTopTokensByChain = async (chainId) => {
	try {
		if (!geckoTerminalChainsMap[chainId]) {
			return [chainId, []];
		}

		const resData: any[] = [];

		for (let i = 1; i <= 5; i++) {
			const prevRes = await fetch(
				`https://api.geckoterminal.com/api/v2/networks/${geckoTerminalChainsMap[chainId]}/pools?include=dex%2Cdex.network%2Cdex.network.network_metric%2Ctokens&page=${i}&include_network_metrics=true`
			)
				.then((r) => r.json())
				.catch(() => ({ data: [], included: [] }));

			resData.push(...prevRes.data);
		}

		const result = resData.map((pool) => {
			return { ...pool, baseToken: pool.relationships.base_token.data.id.split('_')[1] };
		});

		return [chainId, result];
	} catch (error) {
		return [chainId, []];
	}
};
