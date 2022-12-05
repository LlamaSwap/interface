export const capitalizeFirstLetter = (word) => word.charAt(0).toUpperCase() + word.slice(1);

export function chainIconUrl(chain) {
	return `/chain-icons/rsz_${chain.toLowerCase()}.jpg`;
}

export function getSavedTokens() {
	return JSON.parse(localStorage.getItem('savedTokens') || '{}');
}
