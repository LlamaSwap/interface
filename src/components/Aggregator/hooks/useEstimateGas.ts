import { useQueries, UseQueryOptions } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { encodeFunctionData, maxInt256, zeroAddress } from 'viem';
import { IRoute } from '~/queries/useGetRoutes';
import { chainsMap, tokenApprovalAbi } from '../constants';
import { useMemo } from 'react';

const traceRpcs = {
	// https://docs.blastapi.io/blast-documentation/trace-api
	ethereum: 'https://eth-mainnet.blastapi.io/090c6ffd-6cd1-40d1-98af-338a96523ea1',
	bsc: 'https://bsc-mainnet.blastapi.io/090c6ffd-6cd1-40d1-98af-338a96523ea1',
	gnosis: 'https://gnosis-mainnet.blastapi.io/090c6ffd-6cd1-40d1-98af-338a96523ea1',
	moonbeam: 'https://moonbeam.blastapi.io/090c6ffd-6cd1-40d1-98af-338a96523ea1',
	moonriver: 'https://moonriver.blastapi.io/090c6ffd-6cd1-40d1-98af-338a96523ea1',
	//palm: 'https://palm-mainnet.blastapi.io/090c6ffd-6cd1-40d1-98af-338a96523ea1', // we don't support it
	polygon: 'https://polygon-mainnet.blastapi.io/090c6ffd-6cd1-40d1-98af-338a96523ea1',
	//arbitrum: 'https://arbitrum-one.blastapi.io/090c6ffd-6cd1-40d1-98af-338a96523ea1'
};

export const estimateGas = async ({
	route,
	token,
	userAddress,
	chain,
	balance
}: {
	route: IRoute;
	token?: string;
	userAddress?: string;
	chain?: string;
	balance?: number | null;
}) => {
	if (
		!token ||
		!userAddress ||
		!chain ||
		!balance ||
		!Number.isFinite(balance) ||
		balance < +route.fromAmount ||
		!route.price ||
		!traceRpcs[chain]
	) {
		return null;
	}

	try {
		const tx = route?.tx;
		const isNative = token === zeroAddress;

		try {
			const approveTx = isNative
				? null
				: {
						to: token,
						data: encodeFunctionData({
							abi: tokenApprovalAbi,
							functionName: 'approve',
							args: [route.price.tokenApprovalAddress, maxInt256]
						})
					};

			const resetApproveTx = isNative
				? null
				: {
						to: token,
						data: encodeFunctionData({
							abi: tokenApprovalAbi,
							functionName: 'approve',
							args: [route.price.tokenApprovalAddress, 0n]
						})
					};

			const callParams = [resetApproveTx, approveTx, tx].filter(Boolean).map((txData) => [
				{
					from: userAddress,
					to: txData!.to,
					data: txData!.data,
					...(isNative ? { value: '0x' + BigNumber(route.fromAmount).toString(16) } : {})
				},
				['trace']
			]);

			const response = await fetch(traceRpcs[chain], {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					id: chainsMap[chain],
					jsonrpc: '2.0',
					method: chain === 'arbitrum' ? 'arbtrace_callMany' : 'trace_callMany',
					params: [callParams, 'latest']
				})
			}).then((res) => res.json());

			if (response.error) {
				console.log(response.error);
				return null;
			}

			const swapTx = response.result[response.result.length - 1];

			if (!swapTx) return null;

			return {
				gas: (Number(swapTx.trace[0].result?.gasUsed ?? '0x0') + 21e3).toString(), // ignores calldata and accesslist costs
				isFailed: swapTx.trace[0]?.error?.includes('Revert') ?? false,
				aggGas: route.price?.estimatedGas,
				name: route.name
			};
		} catch (e) {
			console.log(e);
			return null;
		}
	} catch (ee) {
		console.log('[ESTIMATE GAS]', ee);
		throw new Error(`Failed to estimate gas of ${route.name}`);
	}
};

type EstimationRes = Awaited<ReturnType<typeof estimateGas>>;

export const useEstimateGas = ({
	routes,
	token,
	userAddress,
	chain,
	balance,
	isOutput
}: {
	routes: Array<IRoute>;
	token?: string;
	userAddress?: string;
	chain?: string;
	balance?: number | null;
	isOutput: boolean;
}) => {
	const res = useQueries({
		queries: routes
			.filter((route) => !!route?.tx?.to)
			.map<UseQueryOptions<Awaited<ReturnType<typeof estimateGas>>>>((route) => {
				return {
					queryKey: ['estimateGas', route.name, chain, route?.tx?.data, balance],
					queryFn: () => estimateGas({ route, token, userAddress, chain, balance })
				};
			})
	});

	const data = useMemo(() => {
		return (
			res
				?.filter((r) => r.status === 'success' && !!r.data && r.data.gas)
				.reduce(
					(acc, r: any) => ({
						...acc,
						[r.data.name]: r.data
					}),
					{} as Record<string, EstimationRes>
				) ?? {}
		);
	}, [res]);

	return {
		isLoading: res.some((r) => r.status === 'pending') || (chain && traceRpcs[chain] === undefined),
		data
	};
};
