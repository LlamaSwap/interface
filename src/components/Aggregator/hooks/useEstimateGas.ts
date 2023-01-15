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
		const txData = await Promise.all(routesWithTx.map(async ({ price, name, tx }) => {
			try{
			const approveTx = {
				...await tokenContract.populateTransaction.approve(tx.to, ethers.constants.MaxUint256.toHexString()),
				from: userAddress 
			}
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
			console.log(name, swapTx)
			return {
				gas: BigNumber(swapTx.trace[0].result.gasUsed).toString(),// swapTx.trace.reduce((acc, val) => BigNumber(val.result.gasUsed).plus(acc), BigNumber(0)).toString(),
				isFailed: !!swapTx.trace.find((a) => a.error === 'Reverted'),
				aggGas: price.estimatedGas,
				name
			}
			} catch(e){
				return null
			}
		}));
		console.log(txData)
		return txData.reduce((acc, val, i) => ({
			...acc,
			[val.name]: val
		}), {})
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
