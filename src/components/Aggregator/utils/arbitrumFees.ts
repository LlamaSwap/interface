import { readContract } from 'wagmi/actions';
import { config } from '../../WalletProvider';
import { arbitrum } from 'viem/chains';

export async function applyArbitrumFees(to: string, data: string, gas: string) {
	const gasData2 = await readContract(config, {
		address: '0x00000000000000000000000000000000000000C8',
		abi: [
			{
				inputs: [
					{ internalType: 'address', name: 'to', type: 'address' },
					{ internalType: 'bool', name: 'contractCreation', type: 'bool' },
					{ internalType: 'bytes', name: 'data', type: 'bytes' }
				],
				name: 'gasEstimateL1Component',
				outputs: [
					{ internalType: 'uint64', name: 'gasEstimateForL1', type: 'uint64' },
					{ internalType: 'uint256', name: 'baseFee', type: 'uint256' },
					{ internalType: 'uint256', name: 'l1BaseFeeEstimate', type: 'uint256' }
				],
				stateMutability: 'view',
				type: 'function'
			}
		],
		chainId: arbitrum.id,
		functionName: 'gasEstimateL1Component',
		args: [to as `0x${string}`, false, data as `0x${string}`]
	});

	return Number(BigInt(gas) + gasData2[0]).toString();
}
