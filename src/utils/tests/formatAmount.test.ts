import { formatAmount } from '../formatAmount';

describe('formatAmount', () => {
	it('should format a number', () => {
		const input = 12345;
		const expectedOutput = '12345';
		expect(formatAmount(input)).toBe(expectedOutput);
	});

	it('should format a number with spaces correctly', () => {
		const input = '12 345';
		const expectedOutput = '12345';
		expect(formatAmount(input)).toBe(expectedOutput);
	});

	it('should format a string', () => {
		const input = '12345';
		const expectedOutput = '12345';
		expect(formatAmount(input)).toBe(expectedOutput);
	});

	it('should format a string with multiple spaces spaces', () => {
		const input = ' 12 34 5 ';
		const expectedOutput = '12345';
		expect(formatAmount(input)).toBe(expectedOutput);
	});
});
