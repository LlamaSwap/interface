import { BigNumber } from 'ethers';
import { countBits, encode, removeFirstBit } from '../../llamazip/encode';

describe('Path encoding tests', () => {
	test('countBits function test', () => {
		expect(countBits(BigNumber.from(0))).toBe(0);
		expect(countBits(BigNumber.from(1))).toBe(1);
		expect(countBits(BigNumber.from(2))).toBe(2);
		expect(countBits(BigNumber.from(3))).toBe(2);
		expect(countBits(BigNumber.from(16))).toBe(5);
	});

	test('removeFirstBit function test', () => {
		expect(removeFirstBit(BigNumber.from('1'))).toBe('0x');
		expect(removeFirstBit(BigNumber.from('0x0100'))).toBe('0x00');
		expect(removeFirstBit(BigNumber.from('0x010101'))).toBe('0x0101');
	});

	test('encode function test - invalid slippage', () => {
		expect(() => encode('0', true, '1000000000', '0.9', true)).toThrow('Slippage number not supported');
	});
});
