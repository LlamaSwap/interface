import { readContract } from 'wagmi/actions';
import { config } from '../../WalletProvider';
import { chainsMap } from '../constants';

const FEE_ADDRESS = '0x420000000000000000000000000000000000000F';

export const chainsWithOpFees = ['optimism', 'base'];

export const getOptimismFee = async (txData, chain) => {
	if (!chain || !chainsMap[chain]) return 'Unknown';

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
			args: [txData],
			chainId: chainsMap[chain]
		});

		return Number(gas) / 1e18;
	} catch (e) {
		console.log(e, txData);
		return 'Unknown';
	}
};
