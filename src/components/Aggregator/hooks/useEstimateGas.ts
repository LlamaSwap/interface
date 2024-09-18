import { useQueries, UseQueryOptions } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { encodeFunctionData, maxInt256, zeroAddress } from 'viem';
import { IRoute } from '~/queries/useGetRoutes';
import { chainsMap } from '../constants';

const traceRpcs = {
	// https://docs.blastapi.io/blast-documentation/trace-api
	ethereum: 'https://eth-mainnet.blastapi.io/090c6ffd-6cd1-40d1-98af-338a96523ea1',
	bsc: 'https://bsc-mainnet.blastapi.io/090c6ffd-6cd1-40d1-98af-338a96523ea1',
	gnosis: 'https://gnosis-mainnet.blastapi.io/090c6ffd-6cd1-40d1-98af-338a96523ea1',
	moonbeam: 'https://moonbeam.blastapi.io/090c6ffd-6cd1-40d1-98af-338a96523ea1',
	moonriver: 'https://moonriver.blastapi.io/090c6ffd-6cd1-40d1-98af-338a96523ea1',
	//palm: 'https://palm-mainnet.blastapi.io/090c6ffd-6cd1-40d1-98af-338a96523ea1', // we don't support it
	polygon: 'https://polygon-mainnet.blastapi.io/090c6ffd-6cd1-40d1-98af-338a96523ea1',
	arbitrum: 'https://arbitrum-one.blastapi.io/090c6ffd-6cd1-40d1-98af-338a96523ea1'
};

export const estimateGas = async ({
	route,
	token,
	userAddress,
	chain,
	balance,
	isOutput
}: {
	route: IRoute;
	token?: string;
	userAddress?: string;
	chain?: string;
	balance?: number | null;
	isOutput: boolean;
}) => {
	if (
		!token ||
		!userAddress ||
		!chain ||
		!balance ||
		!Number.isFinite(balance) ||
		balance < +route.fromAmount ||
		!route.price ||
		!traceRpcs[chain] ||
		(chain === 'polygon' && isOutput)
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
						to: route.price.tokenApprovalAddress,
						data: encodeFunctionData({
							abi: [
								{
									constant: false,
									inputs: [
										{ name: '_spender', type: 'address' },
										{ name: '_value', type: 'uint256' }
									],
									name: 'approve',
									outputs: [],
									payable: false,
									stateMutability: 'nonpayable',
									type: 'function'
								}
							],
							functionName: 'approve',
							args: [route.price.tokenApprovalAddress, maxInt256]
						})
					};

			const resetApproveTx = isNative
				? null
				: {
						to: route.price.tokenApprovalAddress,
						data: encodeFunctionData({
							abi: [
								{
									constant: false,
									inputs: [
										{ name: '_spender', type: 'address' },
										{ name: '_value', type: 'uint256' }
									],
									name: 'approve',
									outputs: [],
									payable: false,
									stateMutability: 'nonpayable',
									type: 'function'
								}
							],
							functionName: 'approve',
							args: [route.price.tokenApprovalAddress, 0n]
						})
					};

			const callParams2 = [resetApproveTx, approveTx, tx].filter(Boolean).map((txData) => [
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
					params: [callParams2, 'latest']
				})
			}).then((res) => res.json());

			if (response.error) {
				console.log(response.error);
				return null;
			}

			const swapTx = response.result[2];

			if (!swapTx) return null;

			return {
				gas: (Number(swapTx.trace[0].result?.gasUsed ?? '0x0') + 21e3).toString(), // ignores calldata and accesslist costs
				isFailed: swapTx.trace[0]?.error === 'Revert',
				aggGas: route.price?.estimatedGas,
				name: route.name
			};
		} catch (e) {
			console.log(e);
			return null;
		}
	} catch (ee) {
		console.log('[ESTIMATE GAS]', ee);
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
					queryKey: ['estimateGas', route.name, chain, route?.tx?.data, balance, isOutput],
					queryFn: () => estimateGas({ route, token, userAddress, chain, balance, isOutput })
				};
			})
	});

	const data =
		res
			?.filter((r) => r.status === 'success' && !!r.data && r.data.gas)
			.reduce(
				(acc, r) => ({
					...acc,
					[(
						r.data as {
							gas: string;
							isFailed: boolean;
							aggGas: any;
							name: any;
						}
					).name]: r.data
				}),
				{} as Record<string, EstimationRes>
			) ?? {};

	return {
		isLoading: res.some((r) => r.status === 'pending') || (chain && traceRpcs[chain] === undefined),
		data
	};
};
