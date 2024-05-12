import { useQueries, UseQueryOptions } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { last } from 'lodash';
import { erc20ABI } from 'wagmi';
import { IRoute } from '~/queries/useGetRoutes';
import { providers } from '../rpcs';

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

export const estimateGas = async ({ route, token, userAddress, chain, balance }) => {
	if (!Number.isFinite(balance) || balance < +route.fromAmount) return null;

	try {
		const provider = new ethers.providers.StaticJsonRpcProvider(traceRpcs[chain], providers[chain]._network);
		const tokenContract = new ethers.Contract(token, erc20ABI, provider);
		const tx = route?.tx;
		const isNative = token === ethers.constants.AddressZero;
		try {
			const approveTx = isNative
				? null
				: {
						...(await tokenContract.populateTransaction.approve(
							route.price.tokenApprovalAddress,
							'0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
						)),
						from: userAddress
				  };
			const resetApproveTx = isNative
				? null
				: await tokenContract.populateTransaction.approve(route.price.tokenApprovalAddress, ethers.constants.HashZero);
			const callParams = [
				[resetApproveTx, approveTx, tx].filter(Boolean).map((txData) => [
					{
						from: userAddress,
						to: txData.to,
						data: txData.data,
						...(isNative ? { value: '0x' + BigNumber(route.fromAmount).toString(16) } : {})
					},
					['trace']
				]),
				'latest'
			];
			const res = await provider.send(chain === 'arbitrum' ? 'arbtrace_callMany' : 'trace_callMany', callParams);
			const swapTx = last<{ trace: Array<{ result: { gasUsed: string }; error: string }> }>(res);
			return {
				gas: (Number(swapTx.trace[0].result.gasUsed) + 21e3).toString(), // ignores calldata and accesslist costs
				isFailed: swapTx.trace[0]?.error === 'Reverted',
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
	token: string;
	userAddress: string;
	chain: string;
	balance: number;
	isOutput: boolean;
}) => {
	const res = useQueries({
		queries: routes
			.filter((route) => !!route?.tx?.to)
			.map<UseQueryOptions<Awaited<ReturnType<typeof estimateGas>>>>((route) => {
				return {
					queryKey: ['estimateGas', route.name, chain, route?.tx?.data, balance],
					queryFn: () => estimateGas({ route, token, userAddress, chain, balance }),
					enabled: traceRpcs[chain] !== undefined && (chain === 'polygon' && isOutput ? false : true) && !!userAddress // TODO: figure out why it doesn't work
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
