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

export const formattedNum = (number, symbol = false, acceptNegatives = false) => {
	let currencySymbol
	if (symbol === true) {
		currencySymbol = '$'
	} else if (symbol === false) {
		currencySymbol = ''
	} else {
		currencySymbol = symbol
	}
	if (isNaN(number) || number === '' || number === undefined) {
		return symbol ? `${currencySymbol}0` : 0
	}
	let num = parseFloat(number)
	const isNegative = num < 0

	const currencyMark = isNegative ? `${currencySymbol}-` : currencySymbol
	const normalMark = isNegative ? '-' : ''

	// if (num > 10000000) {
	// 	return (symbol ? currencyMark : normalMark) + toK(num.toFixed(0), true)
	// }

	if (num === 0) {
		return symbol ? `${currencySymbol}0` : 0
	}

	if (num < 0.0001 && num > 0) {
		return symbol ? `< ${currencySymbol}0.0001` : '< 0.0001'
	}

	// if (num > 1000) {
	// 	return symbol
	// 		? currencyMark + Number(parseFloat(num).toFixed(0)).toLocaleString()
	// 		: normalMark + Number(parseFloat(num).toFixed(0)).toLocaleString()
	// }

	// if (symbol) {
	// 	if (num < 0.1) {
	// 		return currencyMark + Number(parseFloat(num).toFixed(2))
	// 	} else {
	// 		let usdString = priceFormatter.format(num) // priceFoematter isn't defined on llama main repo
	// 		return currencyMark + usdString.slice(1, usdString.length)
	// 	}
	// }

	return Number(num.toFixed(2))
}