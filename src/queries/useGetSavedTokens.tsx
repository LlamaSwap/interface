import { useQuery } from '@tanstack/react-query';
import { getSavedTokens } from '~/utils';

function fetchSavedTokens(chainId?: number | null) {
	const savedTokens = getSavedTokens();

	return savedTokens[chainId] || [];
}

export function useGetSavedTokens(chainId?: number | null) {
	return useQuery(['savedTokens', chainId], () => fetchSavedTokens(chainId), {
		refetchInterval: 20_000
	});
}
