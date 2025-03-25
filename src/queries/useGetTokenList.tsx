import { useQuery } from '@tanstack/react-query';
import { getTokenList } from '~/props/getTokenList';

export async function getList() {
	try {
		const data = await getTokenList();
		return data;
	} catch (error) {
		throw new Error(error instanceof Error ? error.message : 'Failed to fetch');
	}
}

export const useGetTokenList = () => {
	return useQuery({ queryKey: ['token-list'], queryFn: getList });
};

export async function getTokenListByChain({ chainId }: { chainId: number | null | undefined }) {
	if (!chainId) return {};
	try {
		const data = await getTokenList(chainId).catch(() => null);

		if (!data) {
			const dataAllChains = await getTokenList();

			if (!dataAllChains[chainId]) return {};

			const tokens = {};

			for (const token of dataAllChains[chainId]) {
				tokens[token.address] = token;
			}

			return tokens;
		}

		return data;
	} catch (error) {
		throw new Error(error instanceof Error ? error.message : 'Failed to fetch');
	}
}

export const useGetTokenListByChain = ({ chainId }: { chainId: number | null | undefined }) => {
	return useQuery({
		queryKey: ['token-list', chainId],
		queryFn: () => getTokenListByChain({ chainId }),
		staleTime: 60 * 60 * 1000,
		refetchInterval: 60 * 60 * 1000,
		refetchOnWindowFocus: false
	});
};
