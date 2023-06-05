import { ethers } from 'ethers';
import { chainToId, getQuote } from '../openocean';
import { mockFetch, setupFetchMocks } from './mock';

const mockedFetch = mockFetch();

describe('OpenOcean Test', () => {
	afterEach(() => {
		mockedFetch.mockReset();
	});
	test('fetches quote with correct query parameters', async () => {
		const gasPriceResponse = { fast: { maxFeePerGas: 50 } };
		const swapData = {
			estimatedGas: 20000,
			outAmount: 500,
			to: '0x123',
			data: '0x456'
		};

		setupFetchMocks({ gasPriceResponse, swapData, mockedFetch });

		const chain = 'ethereum';
		const from = ethers.constants.AddressZero;
		const to = '0x1234567890123456789012345678901234567890';
		const amount = '1000000000000000000';
		const extra = {
			userAddress: '0x9876543210987654321098765432109876543210',
			slippage: 1
		};

		await getQuote(chain, from, to, amount, extra);

		const expectedUrl = `https://ethapi.openocean.finance/v2/${
			chainToId[chain]
		}/swap?inTokenAddress=${from}&outTokenAddress=${to}&amount=${amount}&gasPrice=${
			gasPriceResponse.fast.maxFeePerGas
		}&slippage=${+extra.slippage * 100}&account=${
			extra.userAddress
		}&referrer=0x5521c3dfd563d48ca64e132324024470f3498526`;

		expect(mockedFetch).toHaveBeenCalledWith(expectedUrl);
	});

	test('returns the correct quote data when response is successful', async () => {
		const gasPriceResponse = { fast: { maxFeePerGas: 50 } };
		const swapData = {
			estimatedGas: 20000,
			outAmount: 500,
			to: '0x123',
			data: '0x456'
		};
		setupFetchMocks({ gasPriceResponse, swapData, mockedFetch });

		const chain = 'ethereum';
		const from = ethers.constants.AddressZero;
		const to = '0x1234567890123456789012345678901234567890';
		const amount = '1000000000000000000';
		const extra = {
			userAddress: '0x9876543210987654321098765432109876543210',
			slippage: 1
		};

		const quote = await getQuote(chain, from, to, amount, extra);

		expect(quote).toEqual({
			amountReturned: swapData.outAmount,
			estimatedGas: swapData.estimatedGas,
			tokenApprovalAddress: '0x6352a56caadc4f1e25cd6c75970fa768a3304e64',
			rawQuote: { ...swapData, gasLimit: swapData.estimatedGas },
			logo: 'https://assets.coingecko.com/coins/images/17014/small/ooe_log.png?1626074195'
		});
	});
});
