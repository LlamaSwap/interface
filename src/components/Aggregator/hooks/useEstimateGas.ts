import { useQueries, UseQueryOptions } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { last } from 'lodash';
import { erc20ABI } from 'wagmi';
import { IRoute } from '~/queries/useGetRoutes';

const traceRpcs = {
	ethereum: 'https://eth-mainnet.blastapi.io/cfee5a54-245d-411b-ba94-da15d5437e88',
	bsc: 'https://bsc-mainnet.blastapi.io/cfee5a54-245d-411b-ba94-da15d5437e88',
	gnosis: 'https://gnosis-mainnet.blastapi.io/cfee5a54-245d-411b-ba94-da15d5437e88',
	polygon: 'https://polygon.llamarpc.com'
};

export const estimateGas = async ({ route, token, userAddress, chain, amount }) => {
	try {
		const provider = new ethers.providers.JsonRpcProvider(traceRpcs[chain]);
		const tokenContract = new ethers.Contract(token, erc20ABI, provider);
		const tx = route?.tx;
		const isNative = token === ethers.constants.AddressZero;
		try {
			const approveTx = isNative
				? null
				: {
						...(await tokenContract.populateTransaction.approve(
							route.price.tokenApprovalAddress,
							"0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
						)),
						from: userAddress
				  };
			const callParams = [
				[approveTx, tx].filter(Boolean).map((txData) => [
					{
						from: userAddress,
						to: txData.to,
						data: txData.data,
						...(isNative ? { value: '0x' + BigNumber(amount).toString(16) } : {})
					},
					['trace']
				]),
				'latest'
			];
			const res = await provider.send('trace_callMany', callParams);
			const swapTx = last<{ trace: Array<{ result: { gasUsed: string }; error: string }> }>(res);
			return {
				gas: (Number(swapTx.trace[0].result.gasUsed) + 21e3).toString(), // ignores calldata and accesslist costs
				isFailed: swapTx.trace[0]?.error === 'Reverted',
				aggGas: route.price?.estimatedGas,
				name: route.name,
			};
		} catch (e) {
			console.log(e);
			return null;
		}
	} catch (ee) {
		console.log(ee);
	}
};

type EstimationRes = Awaited<ReturnType<typeof estimateGas>>;

export const useEstimateGas = ({
	routes,
	token,
	userAddress,
	chain,
	amount,
	hasEnoughBalance
}: {
	routes: Array<IRoute>;
	token: string;
	userAddress: string;
	chain: string;
	amount: string;
	hasEnoughBalance: boolean;
}) => {
	const res = useQueries({
		queries: routes
			.filter((route) => !!route?.tx?.to)
			.map<UseQueryOptions<Awaited<ReturnType<typeof estimateGas>>>>((route) => {
				return {
					queryKey: ['estimateGas', route.name, chain, route?.tx?.data],
					queryFn: () => estimateGas({ route, token, userAddress, chain, amount }),
					enabled: traceRpcs[chain] !== undefined && hasEnoughBalance
				};
			})
	});

	const data =
		res
			?.filter((r) => r.status === 'success' && !!r.data && r.data.gas)
			.reduce((acc, r) => ({ ...acc, [r.data.name]: r.data }), {} as Record<string, EstimationRes>) ?? {};
	return {
		isLoading: res.some((r) => r.status === 'loading') || traceRpcs[chain] === undefined,
		data
	};
};
