import { getQuote } from '../hashflow';
import { mockFetch, setupFetchMocks } from './mock';

class MockContract {
	address: any;
	abi: any;
	provider: any;
	populateTransaction: any;

	toHexString: jest.Mock<any, any, any>; // Add this line
	constructor(address = null, abi = null, provider = null) {
		this.address = address;
		this.abi = abi;
		this.provider = provider;

		this.populateTransaction = {
			tradeSingleHop: jest.fn().mockResolvedValue({
				data: '0x1234567890abcdef',
				toHexString: jest.fn().mockReturnValue('0x1234567890abcdef') // Add this line
			})
		};

		this.toHexString = jest.fn().mockReturnValue('0x1234567890abcdef');
	}
}

const mockedFetch = mockFetch();

jest.mock('@ethersproject/contracts', () =>
	Object.defineProperty(
		{
			...jest.requireActual('@ethersproject/contracts'),
			Contract: MockContract
		},
		'Contract',
		{ get: () => MockContract }
	)
);

describe('HashFlow Test', () => {
	test('should return a valid quote', async () => {
		const chain = 'ethereum';
		const from = '0x1111111111111111111111111111111111111111';
		const to = '0x2222222222222222222222222222222222222222';
		const amount = '1000000000000000000';
		const extra = {
			slippage: 0.01,
			userAddress: '0x3333333333333333333333333333333333333333'
		};
		const swapData = {
			gasEstimate: '60000',
			quoteData: {
				pool: '0x4444444444444444444444444444444444444444',
				eoa: '0x0000000000000000000000000000000000000000',
				trader: '0x3333333333333333333333333333333333333333',
				effectiveTrader: '0x3333333333333333333333333333333333333333',
				baseToken: from,
				quoteToken: to,
				baseTokenAmount: amount,
				quoteTokenAmount: '900000000000000000',
				quoteExpiry: Math.floor(Date.now() / 1000) + 1200000,
				nonce: 1,
				txid: '0x5555555555555555555555555555555555555555555555555555555555555555',
				signature: '0x1234567890abcdef'
			}
		};

		setupFetchMocks({ swapData, mockedFetch });

		const quote = await getQuote(chain, from, to, amount, extra);

		expect(quote).toMatchObject({
			amountReturned: expect.any(String),
			amountIn: expect.any(String),
			estimatedGas: expect.any(String),
			tokenApprovalAddress: expect.any(String),
			validTo: expect.any(Number),
			rawQuote: expect.any(Object),
			isMEVSafe: true
		});
	});
});
