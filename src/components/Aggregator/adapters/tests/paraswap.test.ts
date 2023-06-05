import { ethers } from 'ethers';
import { defillamaReferrerAddress } from '../../constants';
import { getQuote } from '../paraswap';

const fromToken = {
	decimals: 18
};

const toToken = {
	decimals: 18
};

const mockApiResponse = {
	priceRoute: {
		srcToken: '0xTokenFromAddress',
		srcDecimals: 18,
		destToken: '0xTokenToAddress',
		destDecimals: 18,
		destAmount: '1000000000000000000',
		srcAmount: '1000000000000000000',
		gasCost: '50000',
		tokenTransferProxy: '0xTokenTransferProxyAddress'
	}
};

global.fetch = jest.fn(() =>
	Promise.resolve({
		json: () => Promise.resolve(mockApiResponse)
	})
) as any;

describe('ParaSwap Test', () => {
	test('returns a quote with correct properties', async () => {
		const chain = 'ethereum';
		const from = '0xTokenFromAddress';
		const to = '0xTokenToAddress';
		const amount = (1e18).toFixed();
		const extraData = {
			fromToken,
			toToken,
			userAddress: defillamaReferrerAddress,
			slippage: '0.5',
			amountOut: ''
		};

		const result = await getQuote(chain, from, to, amount, extraData);

		expect(+result.amountReturned).toBeGreaterThan(0);
		expect(result.tokenApprovalAddress).toBeDefined();
	});

	test('returns a quote for swapping native token to a token', async () => {
		const chain = 'ethereum';
		const from = ethers.constants.AddressZero;
		const to = '0xTokenToAddress';
		const amount = (1e18).toFixed();
		const extraData = {
			fromToken: { decimals: 18 },
			toToken: { decimals: 18 },
			userAddress: defillamaReferrerAddress,
			slippage: '0.5',
			amountOut: ''
		};

		const result = await getQuote(chain, from, to, amount, extraData);

		expect(+result.amountReturned).toBeGreaterThan(0);
		expect(+result.amountIn).toBeGreaterThanOrEqual(+amount);
		expect(+result.estimatedGas).toBeGreaterThan(0);
		expect(result.tokenApprovalAddress).toBeDefined();
		expect(result.rawQuote).toBeDefined();
	});
	test('returns a quote for swapping token to native token', async () => {
		const chain = 'ethereum';
		const from = '0xTokenFromAddress';
		const to = ethers.constants.AddressZero;
		const amount = (1e18).toFixed();
		const extraData = {
			fromToken: { decimals: 18 },
			toToken: { decimals: 18 },
			userAddress: defillamaReferrerAddress,
			slippage: '0.5',
			amountOut: ''
		};

		const result = await getQuote(chain, from, to, amount, extraData);

		expect(+result.amountReturned).toBeGreaterThan(0);
		expect(+result.amountIn).toBeGreaterThanOrEqual(+amount);
		expect(+result.estimatedGas).toBeGreaterThan(0);
		expect(result.tokenApprovalAddress).toBeDefined();
		expect(result.rawQuote).toBeDefined();
	});
});
