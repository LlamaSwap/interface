import { get } from 'lodash';
import { getSavedTokens } from '~/utils';

function fetchSavedTokens(chainId?: number | null) {
	if (!chainId) return [];

	const savedTokens = getSavedTokens();

	return get(savedTokens, chainId, []);
}

export function useGetSavedTokens(chainId?: number | null) {
	return fetchSavedTokens(chainId);
}
