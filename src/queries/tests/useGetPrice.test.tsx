import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGetPrice } from '../useGetPrice';
import { mockFetch } from '../../components/Aggregator/adapters/tests/mock';

const queryClient = new QueryClient();

const wrapper = ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
mockFetch({ isNodeFetch: true });

describe('useGetPrice hook', () => {
	const chain = 'ethereum';
	const fromToken = '0x6b175474e89094c44da98b954eedeac495271d0f'; // DAI
	const toToken = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'; // WETH
	const skipRefetch = false;

	test('should fetch token prices', async () => {
		const { result } = renderHook(
			() =>
				useGetPrice({
					chain,
					fromToken,
					toToken,
					skipRefetch
				}),
			{ wrapper }
		);

		await waitFor(() => expect(result.current.isSuccess).toEqual(true), { timeout: 5_000 });

		expect(result.current.data).toBeDefined();
		expect(result.current.data?.gasTokenPrice).toBeDefined();
		expect(result.current.data?.fromTokenPrice).toBeDefined();
		expect(result.current.data?.toTokenPrice).toBeDefined();
		expect(result.current.data?.gasPriceData).toBeDefined();
	});
});
