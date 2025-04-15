import { getSavedTokens } from '~/utils';

function fetchSavedTokens(chainId?: number | null) {
	if (!chainId) return [];

	const savedTokens = getSavedTokens();

	return Object.fromEntries((savedTokens[chainId] ?? []).map((token) => [token.address.toLowerCase(), token]));
}

export function useGetSavedTokens(chainId?: number | null) {
	return fetchSavedTokens(chainId);
}
