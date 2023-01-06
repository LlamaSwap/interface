export const capitalizeFirstLetter = (word) => word.charAt(0).toUpperCase() + word.slice(1);

const ICONS_CDN = 'https://icons.llamao.fi/icons';

export function chainIconUrl(chain) {
	return `${ICONS_CDN}/chains/rsz_${chain.toLowerCase()}?w=24&h=24`;
}

export function getSavedTokens() {
	return JSON.parse(localStorage.getItem('savedTokens') || '{}');
}

export const median = (arr: number[]): number => {
	const s = [...arr].sort((a, b) => a - b);
	const mid = Math.floor(s.length / 2);
	return s.length % 2 === 0 ? (s[mid - 1] + s[mid]) / 2 : s[mid];
};
