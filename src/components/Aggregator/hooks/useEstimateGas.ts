import { useQueries, useQuery, UseQueryOptions } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { erc20ABI } from 'wagmi';
import { IRoute } from '~/queries/useGetRoutes';

const traceRpcs = {
	ethereum: 'https://eth-mainnet.blastapi.io/d1a75bd1-573d-4116-9e38-dd6717802929',
	bsc: 'https://bsc-mainnet.blastapi.io/d1a75bd1-573d-4116-9e38-dd6717802929',
	gnosis: 'https://gnosis-mainnet.blastapi.io/d1a75bd1-573d-4116-9e38-dd6717802929',
	polygon: 'https://polygon.llamarpc.com'
};

export const estimateGas = async ({ route, token, userAddress, chain }) => {
	try {
		const provider = new ethers.providers.JsonRpcProvider(traceRpcs[chain]);
		const tokenContract = new ethers.Contract(token, erc20ABI, provider);
		const tx = route?.tx;
		try {
			const approveTx = {
				...(await tokenContract.populateTransaction.approve(tx.to, ethers.constants.MaxUint256.toHexString())),
				from: userAddress
			};
			const callParams = [
				[approveTx, tx].map((txData) => [
					{
						from: userAddress,
						to: txData.to,
						data: txData.data
					},
					['trace', 'vmTrace']
				]),
				'latest'
			];
			const res = await provider.send('trace_callMany', callParams);
			const swapTx = res[1];
			return {
				gas: BigNumber(swapTx.trace[0].result.gasUsed).plus(21e3).toString(), // ignores calldata and accesslist costs
				isFailed: !!swapTx.trace.find((a) => a.error === 'Reverted'),
				aggGas: route.price.estimatedGas,
				name: route.name,
				swapTx
			};
		} catch (e) {
			return null;
		}
	} catch (ee) {
		console.log(ee);
	}
};

type EstimationRes = UseQueryOptions<Awaited<ReturnType<typeof estimateGas>>>;

export const useEstimateGas = ({
	routes,
	token,
	userAddress,
	chain
}: {
	routes: Array<IRoute>;
	token: string;
	userAddress: string;
	chain: string;
}) => {
	const res = useQueries({
		queries: routes
			.filter((route) => !!route?.tx?.to)
			.map<EstimationRes>((route) => {
				return {
					queryKey: ['estimateGas', route.name, chain, route?.tx?.data],
					queryFn: () => estimateGas({ route, token, userAddress, chain }),
					enabled: Object.keys(traceRpcs).includes(chain)
				};
			})
	});

	const data =
		res
			?.filter((r) => r.status === 'success' && !!r.data && r.data.gas)
			.reduce((acc, r) => ({ ...acc, [r.data.name]: r.data }), {} as Record<string, EstimationRes>) ?? null;
	console.log(data);
	return {
		isLoading: res.filter((r) => r.status === 'success').length >= 1 ? false : true,
		data
	};
};
