export const formatAmount = (amount: string | number) => amount.toString().trim().split(' ').join('');

export const formatAmountString = (value, prefix = '') => {
	if (isNaN(value)) return value;
	const formatter = Intl.NumberFormat('en', { notation: 'compact' });
	return prefix + formatter.format(value);
};
