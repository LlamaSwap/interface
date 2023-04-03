import { IToken } from '~/types';

const mapTokensByKey = (tokens, key: Array<string>) => {
	return Object.fromEntries(
		Object.entries(tokens).map(([chain, tokens]: [string, Array<IToken>]) => {
			return [
				chain,
				Object.fromEntries(
					tokens.map((token) => {
						const value = key.map((k) => token[k]).filter(Boolean)[0];
						return [token.address.toLowerCase(), value];
					})
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
