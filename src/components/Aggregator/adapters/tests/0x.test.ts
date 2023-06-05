import { ethers } from 'ethers';
import { getQuote } from '../0x';
import { mockFetch, setupFetchMocks } from './mock';

const mockedFetch = mockFetch();

describe('0x/Matcha Test', () => {
	afterEach(() => {
		mockedFetch.mockReset();
	});

	test('returns a quote with correct properties', async () => {
		const chain = 'ethereum';
		const from = ethers.constants.AddressZero;
		const to = '0x1';
		const amount = '1000';
		const extra = {
			userAddress: ethers.constants.AddressZero,
			slippage: 0.01
		};

		setupFetchMocks({
			quoteData: {
				buyAmount: '900',
				sellAmount: '1000',
				gas: '50000',
				to: '0x3'
			},
			mockedFetch
		});

		const result = await getQuote(chain, from, to, amount, extra);

		expect(result).toHaveProperty('amountReturned', '900');
		expect(result).toHaveProperty('amountIn', '1000');
		expect(result).toHaveProperty('estimatedGas', '50000');
		expect(result).toHaveProperty('tokenApprovalAddress', '0x3');
		expect(result).toHaveProperty('rawQuote');
		expect(result.rawQuote).toHaveProperty('gasLimit', '50000');
		expect(result).toHaveProperty('logo');
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
				buyAmount: '900',
				sellAmount: '1000',
				gas: '50000',
				to: '0x3'
			},
			mockedFetch
		});

		await getQuote(chain, from, to, amount, extra);

		const fetchUrl = mockedFetch.mock.calls[0][0];

		expect(fetchUrl).toContain(`buyToken=${to}`);
		expect(fetchUrl).toContain(`sellToken=${from}`);
		expect(fetchUrl).toContain(`sellAmount=${amount}`);
		expect(fetchUrl).toContain(`slippagePercentage=${extra.slippage / 100}`);
		expect(fetchUrl).toContain(`takerAddress=${extra.userAddress}`);
	});
});
