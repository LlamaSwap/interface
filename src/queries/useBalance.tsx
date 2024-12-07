import { useQuery } from '@tanstack/react-query';
import { erc20Abi, formatUnits, zeroAddress } from 'viem';
import { getBalance, readContracts } from 'wagmi/actions';
import { nativeAddress } from '~/components/Aggregator/constants';

import { config } from '~/components/WalletProvider';

interface IGetBalance {
	address?: string;
	chainId?: number;
	token?: string;
}

export const getTokenBalance = async ({ address, chainId, token }: IGetBalance) => {
	try {
		if (!address || !chainId || !token) {
			return null;
		}

		if ([zeroAddress, nativeAddress.toLowerCase()].includes(token.toLowerCase())) {
			const data = await getBalance(config, {
				address: address as `0x${string}`,
				chainId
			});

			return data;
		}

		const result = await readContracts(config, {
			allowFailure: false,
			contracts: [
				{
					address: token as `0x${string}`,
					abi: erc20Abi,
					functionName: 'balanceOf',
					args: [address as `0x${string}`],
					chainId
				},
				{
					address: token as `0x${string}`,
					abi: erc20Abi,
					functionName: 'decimals',
					chainId
				}
			]
		});

		return { value: result[0], formatted: formatUnits(result[0], result[1]), decimals: result[1] };
	} catch (error) {
		console.log(error);
		return null;
	}
};

export const useBalance = ({ address, chainId, token }) => {
	const queryData = useQuery({
		queryKey: ['balance', address, chainId, token],
		queryFn: () => getTokenBalance({ address, chainId, token }),
		refetchInterval: 10_000
	});

	return queryData;
};
