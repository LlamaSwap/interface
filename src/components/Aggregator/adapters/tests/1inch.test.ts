import { ethers } from 'ethers';
import { getQuote } from '../1inch';
import { mockFetch, setupFetchMocks } from './mock';

const mockedFetch = mockFetch();

describe('1Inch Test', () => {
	afterEach(() => {
		mockedFetch.mockReset();
	});

	test('returns a quote for a given chain, tokens, and amount', async () => {
		const chain = 'ethereum';
		const from = ethers.constants.AddressZero;
		const to = '0x1';
		const amount = '1000';
		const extra = {
			userAddress: '0x2',
			slippage: 0.01
		};

		setupFetchMocks({
			quoteData: {
				toTokenAmount: '900',
				estimatedGas: '50000'
			},
			spenderData: { address: '0x3' },
			swapData: {
				toTokenAmount: '900',
				tx: {
					to: '0x4',
					data: '0x123456'
				}
			},
			mockedFetch
		});

		const result = await getQuote(chain, from, to, amount, extra);

		expect(result).toEqual({
			amountReturned: '900',
			estimatedGas: '50000',
			tokenApprovalAddress: '0x3',
			rawQuote: {
				toTokenAmount: '900',
				tx: {
					to: '0x4',
					data: '0x123456'
				}
			},
			logo: 'https://icons.llamao.fi/icons/protocols/1inch-network?w=48&q=75'
		});
	});

	test('returns a quote with correct query parameters', async () => {
		const chain = 'ethereum';
		const from = '0x5';
		const to = '0x6';
		const amount = '1000';
		const extra = {
			userAddress: '0x2',
			slippage: 0.05
		};

		setupFetchMocks({
			quoteData: {
				toTokenAmount: '900',
				estimatedGas: '50000'
			},
			spenderData: {
				address: '0x3'
			},
			swapData: {
				toTokenAmount: '900',
				tx: {
					to: '0x4',
					data: '0x123456'
				}
			},
			mockedFetch
		});

		await getQuote(chain, from, to, amount, extra);

		const quoteFetchUrl = mockedFetch.mock.calls[0][0];
		const spenderFetchUrl = mockedFetch.mock.calls[1][0];
		const swapFetchUrl = mockedFetch.mock.calls[2][0];

		expect(quoteFetchUrl).toContain(`fromTokenAddress=${from}`);
		expect(quoteFetchUrl).toContain(`toTokenAddress=${to}`);
		expect(quoteFetchUrl).toContain(`amount=${amount}`);
		expect(quoteFetchUrl).toContain(`slippage=${extra.slippage}`);

		expect(spenderFetchUrl).toContain('spender');

		expect(swapFetchUrl).toContain(`fromTokenAddress=${from}`);
		expect(swapFetchUrl).toContain(`toTokenAddress=${to}`);
		expect(swapFetchUrl).toContain(`amount=${amount}`);
		expect(swapFetchUrl).toContain(`fromAddress=${extra.userAddress}`);
		expect(swapFetchUrl).toContain(`slippage=${extra.slippage}`);
	});
});
