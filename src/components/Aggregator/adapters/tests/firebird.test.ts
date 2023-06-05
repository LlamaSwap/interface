import { ethers } from 'ethers';
import { getQuote } from '../firebird';
import { mockFetch, setupFetchMocks } from './mock';

const mockedFetch = mockFetch();

describe('Firebird Test', () => {
	afterEach(() => {
		mockedFetch.mockReset();
	});

	test('returns a quote with correct properties', async () => {
		const chain = 'ethereum';
		const from = ethers.constants.AddressZero;
		const to = '0x11';
		const amount = '1000';
		const extra = {
			userAddress: ethers.constants.AddressZero,
			slippage: '0.01',
			amountOut: '1'
		};

		setupFetchMocks({
			quoteData: {
				quoteData: {
					maxReturn: {
						totalTo: '900',
						totalGas: '50000'
					}
				}
			},
			encodedData: {
				encodedData: {
					router: '0x33',
					data: '0xabcdef'
				}
			},
			mockedFetch
		});

		const result = await getQuote(chain, from, to, amount, extra);

		expect(result).toHaveProperty('amountReturned', '900');
		expect(result).toHaveProperty('estimatedGas', '50000');
		expect(result).toHaveProperty('tokenApprovalAddress', '0x33');
		expect(result).toHaveProperty('rawQuote');
		expect(result.rawQuote).toHaveProperty('tx');
		expect(result.rawQuote.tx).toHaveProperty('gasLimit', '50000');
	});

	test('returns a quote with correct fetch requests', async () => {
		const chain = 'ethereum';
		const from = '0x55';
		const to = '0x66';
		const amount = '1000';
		const extra = {
			userAddress: '0x22',
			slippage: '0.05'
		};

		const quoteData = {
			quoteData: {
				maxReturn: {
					totalTo: '900',
					totalGas: '50000'
				}
			}
		};

		setupFetchMocks({
			quoteData: {
				...quoteData
			},
			encodedData: {
				encodedData: {
					router: '0x33',
					data: '0xabcdef'
				}
			},
			mockedFetch
		});

		await getQuote(chain, from, to, amount, extra);

		const quoteFetchUrl = mockedFetch.mock.calls[0][0];
		expect(quoteFetchUrl).toContain(`from=${from}`);
		expect(quoteFetchUrl).toContain(`to=${to}`);
		expect(quoteFetchUrl).toContain(`amount=${amount}`);
		expect(quoteFetchUrl).toContain(`receiver=${extra.userAddress}`);
		expect(quoteFetchUrl).toContain(`slippage=${+extra.slippage / 100}`);

		const encodeFetchOptions = mockedFetch.mock.calls[1][1];
		expect(encodeFetchOptions).toHaveProperty('method', 'POST');
		expect(encodeFetchOptions).toHaveProperty('body', JSON.stringify(quoteData));
	});
});
