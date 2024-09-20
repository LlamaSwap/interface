import { IToken } from '~/types';

const mapTokensByKey = (tokens: Record<string, Array<IToken>>, key: Array<string>) => {
	return Object.fromEntries(
		Object.entries(tokens).map(([chain, tokens]) => {
			return [
				chain,
				Object.fromEntries(
					tokens
						.map((token) => {
							const value = key.map((k) => token[k]).filter(Boolean)[0];

							return value ? [token.address.toLowerCase(), value] : null;
						})
						.filter(Boolean) as Array<[string, string]>
				)
			];
		})
	);
};

export const getTokensMaps = (tokenlist) => {
	const tokensUrlMap = mapTokensByKey(tokenlist, ['logoURI', 'logoURI2']);
	const tokensSymbolsMap = mapTokensByKey(tokenlist, ['symbol']);

	return { tokensUrlMap, tokensSymbolsMap };
};
