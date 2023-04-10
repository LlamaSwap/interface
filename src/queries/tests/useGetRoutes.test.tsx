import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGetRoutes } from '../useGetRoutes';
import { mockFetch } from '~/components/Aggregator/adapters/tests/mock';
import { defillamaReferrerAddress } from '~/components/Aggregator/constants';

const queryClient = new QueryClient();

mockFetch({ isNodeFetch: true });

const Wrapper = ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;

describe('useGetRoutes Test', () => {
	const chain = 'ethereum';
	const from = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'; // WETH
	const to = '0x6b175474e89094c44da98b954eedeac495271d0f'; // DAI
	const amount = (1e18).toFixed();
	const extra = {
		userAddress: defillamaReferrerAddress,
		slippage: '0.5',
		amountOut: ''
	};

	test('should fetch data for given chain, from, and to tokens', async () => {
		const { result } = renderHook(
			() =>
				useGetRoutes({
					chain,
					from,
					to,
					amount,
					extra
				}),
			{ wrapper: Wrapper }
		);

		await waitFor(() => expect(result.current.isLoaded).toEqual(true), { timeout: 20_000 });

		expect(result.current.isLoading).toBe(false);
		expect(result.current.data.length).toBeGreaterThan(0);
	}, 20_000);

	test('should return data with the expected structure', async () => {
		const { result } = renderHook(
			() =>
				useGetRoutes({
					chain,
					from,
					to,
					amount,
					extra
				}),
			{ wrapper: Wrapper }
		);

		await waitFor(() => expect(result.current.isLoaded).toEqual(true), { timeout: 20_000 });

		const routes = result.current.data;

		routes.forEach((route) => {
			if (route.price.amountReturned) {
				expect(route).toHaveProperty('price');
				expect(route).toHaveProperty('name');
				expect(route).toHaveProperty('fromAmount');
				expect(route).toHaveProperty('txData');
				expect(route).toHaveProperty('l1Gas');
				expect(route).toHaveProperty('tx');
				expect(route).toHaveProperty('isOutputAvailable');

				expect(route.price).toHaveProperty('amountReturned');
				expect(route.price).toHaveProperty('estimatedGas');
				expect(route.price).toHaveProperty('rawQuote');
			}
		});
	}, 20_000);

	test('should not return data for disabled adapters', async () => {
		const disabledAdapters = ['1inch', 'ParaSwap'];

		const { result } = renderHook(
			() =>
				useGetRoutes({
					chain,
					from,
					to,
					amount,
					disabledAdapters,
					extra
				}),
			{ wrapper: Wrapper }
		);

		await waitFor(() => expect(result.current.isLoaded).toEqual(true), { timeout: 20_000 });

		const routes = result.current.data;

		routes.forEach((route) => {
			expect(route.name).not.toBe('1inch');
			expect(route.name).not.toBe('ParaSwap');
		});
	}, 20_000);

	test('should return an empty array when an invalid token address is provided', async () => {
		const chain = 'unknown';
		const amount = (1e18).toFixed();

		const { result } = renderHook(
			() =>
				useGetRoutes({
					chain,
					from,
					to,
					amount,
					extra
				}),
			{ wrapper: Wrapper }
		);

		await waitFor(() => expect(result.current.isLoaded).toEqual(true), { timeout: 20_000 });

		const routes = result.current.data;
		expect(routes).toHaveLength(0);
	}, 20_000);
});
