import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { erc20ABI } from 'wagmi';
import { slots } from '~/constants/slots';

export const estimateGas = async ({ routes, token, userAddress }) => {
	try {
		const provider = new ethers.providers.JsonRpcProvider(
			'https://eth-mainnet.blastapi.io/d1a75bd1-573d-4116-9e38-dd6717802929'
		);
		const tokenContract = new ethers.Contract(token, erc20ABI, provider);
		const routesWithTx = routes.filter(({ tx }) => !!tx?.to);
		const txData = routesWithTx.map(({ tx }) => tx);

		const approveTxs = (
			await Promise.all(
				txData.map(({ to }) => tokenContract.populateTransaction.approve(to, ethers.constants.MaxUint256.toHexString()))
			)
		).map((tx) => ({ ...tx, from: userAddress }));

		const callParams = [
			approveTxs.concat(txData).map((txData) => [
				{
					from: userAddress,
					to: txData.to,
					data: txData.data
				},
				['trace', 'vmTrace']
			]),
			'latest'
		];

		try {
			const res = await provider.send('trace_callMany', callParams);
			const swapTxs = res.slice(res.length / 2, res.length);
			const resObj = swapTxs?.reduce(
				(acc, val, i) => ({
					...acc,
					[routesWithTx[i]?.name]: {
						gas: val.trace.reduce((acc, val) => BigNumber(val.result.gasUsed).plus(acc), BigNumber(0)).toString(),
						isFailed: !!val.trace.find((a) => a.error === 'Reverted'),
						aggGas: routesWithTx[i].price.estimatedGas
					}
				}),
				{}
			);
			console.log(resObj);
			return resObj;
		} catch (e) {
			console.log(e);
			return null;
		}
	} catch (ee) {
		console.log(ee);
	}
};

export const useEstimateGas = ({ routes, token, userAddress, chainId }) => {
	const { data, isLoading } = useQuery(['estimateGas', ...(routes || [])], () =>
		estimateGas({ routes, token, userAddress, chainId })
	);

	console.log(data);

	return { data, isLoading };
};
