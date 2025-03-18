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
		const data = await getTokenList();

		if (!data[chainId]) return {};

		const tokens = {};

		for (const token of data[chainId]) {
			tokens[token.address] = token;
		}

		return tokens;
	} catch (error) {
		throw new Error(error instanceof Error ? error.message : 'Failed to fetch');
	}
}

export const useGetTokenListByChain = ({ chainId }: { chainId: number | null | undefined }) => {
	return useQuery({ queryKey: ['token-list', chainId], queryFn: () => getTokenListByChain({ chainId }) });
};
