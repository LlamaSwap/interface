import { formattedNum } from '..';

describe('formattedNum', () => {
	test('returns a formatted number', () => {
		expect(formattedNum(1234.5678)).toBe('1,234.5678');
	});

	test('returns 0 for non-numeric input', () => {
		expect(formattedNum('non-numeric input')).toBe(0);
	});

	test('formats 8 decimals', () => {
		expect(formattedNum(0.123456789)).toBe('0.12345679');
	});

	test('formats a number greater than 100,000', () => {
		expect(formattedNum(100001.2345)).toBe('100,001.23');
	});
});
