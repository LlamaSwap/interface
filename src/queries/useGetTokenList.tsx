import { useQuery } from '@tanstack/react-query';
import { getTokenList } from '~/props/getTokenList';

export async function getList() {
	try {
		const data = await getTokenList()
		return data;
	} catch (error) {
		throw new Error(error instanceof Error ? error.message : 'Failed to fetch');
	}
}

export const useGetTokenList = () => {
	return useQuery({ queryKey: ['token-list'], queryFn: getList });
};
