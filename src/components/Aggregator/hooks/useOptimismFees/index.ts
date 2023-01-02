import { ethers } from 'ethers';
import { useContractRead, useNetwork } from 'wagmi';
import { providers } from '../../rpcs';
import { FEE_ABI } from './abi';

const FEE_ADDRESS = '0x420000000000000000000000000000000000000F';

export const useOptimismFees = (txData, gasTokenPrice) => {
	const { chain } = useNetwork();

	const { data: l1Fee } = useContractRead({
		address: FEE_ADDRESS,
		abi: FEE_ABI,
		functionName: 'getL1Fee',
		args: [txData],
		enabled: chain?.id === 10,
		cacheTime: 10_000
	});

	return (+l1Fee?.toString() * gasTokenPrice) / 1e18;
};

export const getOptimismFee = async (txData) => {
	const provider = providers.optimism;
	const gasContract = new ethers.Contract(FEE_ADDRESS, FEE_ABI, provider);

	try {
		const gas = await gasContract.getL1Fee(txData);

		return gas / 1e18;
	} catch (e) {
		console.log(e);
		return 'Unknown';
	}
};
