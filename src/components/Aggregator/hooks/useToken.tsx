import { erc20Abi, getAddress } from 'viem';
import { useReadContracts } from 'wagmi';

export const useToken = ({
	address,
	chainId,
	enabled
}: {
	address: `0x${string}`;
	chainId: number;
	enabled: boolean;
}) => {
	const { data, isLoading, error } = useReadContracts({
		allowFailure: false,
		contracts: [
			{
				address,
				abi: erc20Abi,
				functionName: 'name',
				chainId
			},
			{
				address,
				abi: erc20Abi,
				functionName: 'symbol',
				chainId
			},
			{
				address,
				abi: erc20Abi,
				functionName: 'decimals',
				chainId
			}
		],
		query: { enabled }
	});

	return {
		data: data ? { name: data[0], symbol: data[1], decimals: data[2], address: getAddress(address) } : null,
		isLoading,
		error
	};
};
