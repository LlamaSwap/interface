import { ethers } from 'ethers';
import { defillamaReferrerAddress } from '../../constants';
import { getQuote } from '../cowswap';
import { mockFetch } from './mock';

const nativeToken = ethers.constants.AddressZero;

describe('CowSwap test', () => {
	test('throws an error when buy orders from Ether are not allowed', async () => {
		const chain = 'arbitrum';
		const from = ethers.constants.AddressZero;
		const to = nativeToken;
		const amount = (1e18).toFixed();
		const extra = {
			userAddress: defillamaReferrerAddress,
			slippage: '0.5',
			amountOut: '100'
		};

		await expect(getQuote(chain, from, to, amount, extra)).rejects.toThrow('buy orders from Ether are not allowed');
	});

	test('throws an error when a buggy quote is returned from cowswap', async () => {
		const chain = 'arbitrum';
		const from = '0x111';
		const to = '0x222';
		const amount = (1e18).toFixed();
		const extra = {
			userAddress: defillamaReferrerAddress,
			slippage: '0.5'
		};

		global.fetch = jest.fn(() =>
			Promise.resolve({
				json: () =>
					Promise.resolve({
						quote: {
							sellAmount: 0,
							buyAmount: 0,
							partiallyFillable: false
						}
					})
			})
		) as any;

		await expect(getQuote(chain, from, to, amount, extra)).rejects.toThrow('Buggy quote from cowswap');
	});

	test('returns a quote with correct properties', async () => {
		mockFetch({ isNodeFetch: true });
		const chain = 'arbitrum';
		const from = '0x111';
		const to = '0x222';
		const amount = (1e18).toFixed();
		const extra = {
			userAddress: defillamaReferrerAddress,
			slippage: '0.5'
		};
		global.fetch = jest.fn(() =>
			Promise.resolve({
				json: () =>
					Promise.resolve({
						quote: {
							feeAmount: 121,
							sellAmount: 111,
							buyAmount: 111,
							partiallyFillable: false
						}
					})
			})
		) as any;

		const result = await getQuote(chain, from, to, amount, extra);

		expect(result.amountReturned).toBeGreaterThan(0);
		expect(result.tokenApprovalAddress).toBe('0xC92E8bdf79f0507f65a392b0ab4667716BFE0110');
		expect(result.isMEVSafe).toBe(true);
	});
});
