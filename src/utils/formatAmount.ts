export const formatAmount = (amount: string | number) => amount.toString().trim().split(' ').join('');

export const formatAmountString = (value) => {
	const suffixes = ['', 'k', 'm', 'b', 't'];
	const suffixNum = Math.floor(('' + value).length / 3);
	let shortValue = parseFloat((suffixNum !== 0 ? value / Math.pow(1000, suffixNum) : value).toPrecision(3));
	if (shortValue % 1 !== 0) {
		shortValue = shortValue.toFixed(2) as any;
	}
	return shortValue + suffixes[suffixNum];
};
