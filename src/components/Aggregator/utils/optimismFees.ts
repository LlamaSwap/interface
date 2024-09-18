import { readContract } from 'wagmi/actions';
import { config } from '~/components/WalletProvider';

const FEE_ADDRESS = '0x420000000000000000000000000000000000000F';

export const chainsWithOpFees = ['optimism', 'base'];

export const getOptimismFee = async (txData) => {
	try {
		const gas = await readContract(config, {
			address: FEE_ADDRESS,
			abi: [
				{
					inputs: [{ internalType: 'bytes', name: '_data', type: 'bytes' }],
					name: 'getL1Fee',
					outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
					stateMutability: 'view',
					type: 'function'
				}
			],
			functionName: 'getL1Fee',
			args: [txData]
		});

		return Number(gas) / 1e18;
	} catch (e) {
		console.log(e, txData);
		return 'Unknown';
	}
};
