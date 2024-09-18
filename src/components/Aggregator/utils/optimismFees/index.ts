import { FEE_ABI } from './abi';
import { readContract } from 'wagmi/actions';
import { config } from '~/components/WalletProvider';

const FEE_ADDRESS = '0x420000000000000000000000000000000000000F';

export const chainsWithOpFees = ['optimism', 'base'];

export const getOptimismFee = async (txData) => {
	try {
		const gas = await readContract(config, {
			address: FEE_ADDRESS,
			abi: FEE_ABI,
			functionName: 'getL1Fee',
			args: [txData]
		});

		return Number(gas) / 1e18;
	} catch (e) {
		console.log(e, txData);
		return 'Unknown';
	}
};
