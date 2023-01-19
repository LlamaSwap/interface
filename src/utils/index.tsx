export const capitalizeFirstLetter = (word) => word.charAt(0).toUpperCase() + word.slice(1);

const ICONS_CDN = 'https://icons.llamao.fi/icons';

export function chainIconUrl(chain) {
	return `${ICONS_CDN}/agg_icons/${chain.toLowerCase()}?w=24&h=24`;
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
	let currencySymbol;
	if (symbol === true) {
		currencySymbol = '$';
	} else if (symbol === false) {
		currencySymbol = '';
	} else {
		currencySymbol = symbol;
	}
	if (!number || number === '' || Number.isNaN(Number(number))) {
		return symbol ? `${currencySymbol}0` : 0;
	}
	let formattedNum = String();
	let num = parseFloat(number);
	const isNegative = num < 0;

	// const currencyMark = isNegative ? `${currencySymbol}-` : currencySymbol
	// const normalMark = isNegative ? '-' : ''

	// if (num > 10000000) {
	// 	return (symbol ? currencyMark : normalMark) + toK(num.toFixed(0), true)
	// }

	// if (num === 0) {
	// 	return symbol ? `${currencySymbol}0` : 0
	// }

	// if (num < 0.0001 && num > 0) {
	// 	return symbol ? `< ${currencySymbol}0.0001` : '< 0.0001'
	// }

	let maximumFractionDigits = num < 1 ? 7 : 4;
	maximumFractionDigits = num > 100000 ? 2 : maximumFractionDigits;
	formattedNum = num.toLocaleString('en-US', { maximumFractionDigits });

	return String(formattedNum);
};
