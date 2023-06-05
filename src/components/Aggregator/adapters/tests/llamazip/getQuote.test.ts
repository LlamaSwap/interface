import { defillamaReferrerAddress } from '../../../constants';
import { chainToId, getQuote } from '../../llamazip';
import { pairs } from '../../llamazip/pairs';
import { mockFetch } from '../mock';

mockFetch({ isNodeFetch: true });

describe('LlamaZip Test', () => {
	const WETH = pairs.arbitrum[0].token0;
	const USDC = pairs.arbitrum[0].token1;
	const extra = { userAddress: defillamaReferrerAddress, slippage: '0.5' };

	test('returns a quote with correct properties', async () => {
		const res = await getQuote('arbitrum', WETH, USDC, (1e18).toFixed(), extra);

		expect(+res.amountReturned).toBeGreaterThan(0);
		expect(res.tokenApprovalAddress).toBe(chainToId.arbitrum);
	});

	test('returns an empty object when swapping to WETH', async () => {
		const chain = 'arbitrum';
		const amount = (1e18).toFixed();
		const result = await getQuote(chain, USDC, WETH, amount, extra);

		expect(result).toEqual({});
	});

	test('returns an empty object when no possible pairs found', async () => {
		const chain = 'arbitrum';
		const from = '0x2121212121';
		const to = '0x2121212121';
		const amount = (1e18).toFixed();
		const result = await getQuote(chain, from, to, amount, extra);

		expect(result).toEqual({});
	});

	test('returns an empty object when calldata is larger than one EVM word', async () => {
		const chain = 'arbitrum';
		const amount = '1049248029849281882374962947356928349826394871872498729387012047073294870'; // Large input amount
		const result = await getQuote(chain, WETH, USDC, amount, extra);

		expect(result).toEqual({});
	});

	test('throws an error when an unsupported chain is provided', async () => {
		const unsupportedChain = 'chain';
		const amount = (1e18).toFixed();

		await expect(getQuote(unsupportedChain, WETH, USDC, amount, extra)).rejects.toThrow();
	});
});
