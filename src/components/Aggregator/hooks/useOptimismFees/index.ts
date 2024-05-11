import { ethers } from 'ethers';
import { providers } from '../../rpcs';
import { FEE_ABI } from './abi';

const FEE_ADDRESS = '0x420000000000000000000000000000000000000F';

export const chainsWithOpFees = ['optimism', 'base'];

export const getOptimismFee = async (txData) => {
	const provider = providers.optimism;
	const gasContract = new ethers.Contract(FEE_ADDRESS, FEE_ABI, provider);

	try {
		const gas = await gasContract.getL1Fee(txData);

		return gas / 1e18;
	} catch (e) {
		console.log(e, txData);
		return 'Unknown';
	}
};
