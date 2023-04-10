import { ethers } from 'ethers';
import { getQuote } from '../kyberswap';
import { mockFetch } from './mock';

const applyArbitrumFees = jest.fn((routerAddress, encodedSwapData, gas) => gas);

jest.mock('../../utils/arbitrumFees.ts', () => ({
	applyArbitrumFees
}));

const mockedFetch = mockFetch();

describe('KyberSwap Test', () => {
	const nativeToken = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'.toLowerCase();

	const setupFetchMocks = (responseData) => {
		mockedFetch.mockImplementation(() =>
			Promise.resolve({
				json: () => responseData
			})
		);
	};

	afterEach(() => {
		jest.clearAllMocks();
	});

	test('returns a quote for ethereum chain', async () => {
		const responseData = {
			outputAmount: '500',
			totalGas: '21000',
			routerAddress: '0x1'
		};

		setupFetchMocks(responseData);

		const chain = 'ethereum';
		const from = ethers.constants.AddressZero;
		const to = '0x2';
		const amount = '1000';
		const extra = {
			userAddress: '0x3',
			slippage: '0.01'
		};

		const expected = {
			amountReturned: responseData.outputAmount,
			estimatedGas: responseData.totalGas,
			tokenApprovalAddress: responseData.routerAddress,
			rawQuote: { ...responseData, gasLimit: responseData.totalGas },
			logo: 'https://assets.coingecko.com/coins/images/14899/small/RwdVsGcw_400x400.jpg?1618923851'
		};

		const result = await getQuote(chain, from, to, amount, extra);

		expect(result).toEqual(expected);
		expect(mockedFetch).toHaveBeenCalledTimes(1);
	});

	test('fetches quote with correct query parameters', async () => {
		const responseData = {
			totalGas: 20000,
			outputAmount: 500,
			routerAddress: '0x123',
			encodedSwapData: '0x456'
		};

		setupFetchMocks(responseData);

		const chain = 'ethereum';
		const from = ethers.constants.AddressZero;
		const to = '0x123456789';
		const amount = '1000000000000000000';
		const extra = {
			userAddress: '0x9876543210987654321098765432109876543210',
			slippage: '1'
		};

		await getQuote(chain, from, to, amount, extra);

		const expectedUrl = `https://aggregator-api.kyberswap.com/ethereum/route/encode?tokenIn=${nativeToken}&tokenOut=${to}&amountIn=${amount}&to=${
			extra.userAddress
		}&saveGas=0&gasInclude=1&slippageTolerance=${+extra.slippage * 100}&clientData={"source":"DefiLlama"}`;

		expect(mockedFetch).toHaveBeenCalledWith(expectedUrl, { headers: { 'Accept-Version': 'Latest' } });

		const differentExtra = {
			userAddress: '0x11',
			slippage: '2'
		};

		await getQuote(chain, from, to, amount, differentExtra);

		const differentExpectedUrl = `https://aggregator-api.kyberswap.com/ethereum/route/encode?tokenIn=${nativeToken}&tokenOut=${to}&amountIn=${amount}&to=${
			differentExtra.userAddress
		}&saveGas=0&gasInclude=1&slippageTolerance=${+differentExtra.slippage * 100}&clientData={"source":"DefiLlama"}`;

		expect(mockedFetch).toHaveBeenCalledWith(differentExpectedUrl, { headers: { 'Accept-Version': 'Latest' } });
	});
});
