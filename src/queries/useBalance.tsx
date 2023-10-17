import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { ethers } from 'ethers';
import { getAddress } from 'ethers/lib/utils';
import { erc20ABI, useAccount, useBalance as useWagmiBalance } from 'wagmi';
import { nativeAddress } from '~/components/Aggregator/constants';
import { rpcUrls } from '~/components/Aggregator/rpcs';

interface IGetBalance {
	address?: string;
	chainId?: number;
	token?: string;
}

const createProviderAndGetBalance = async ({ rpcUrl, address, token }) => {
	try {
		const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

		if (!token) {
			const balance = await provider.getBalance(address);

			return { value: balance, formatted: ethers.utils.formatEther(balance) };
		}

		const contract = new ethers.Contract(getAddress(token), erc20ABI, provider);

		const [balance, decimals] = await Promise.all([contract.balanceOf(getAddress(address)), contract.decimals()]);

		return { value: balance, formatted: ethers.utils.formatUnits(balance, decimals), decimals };
	} catch (error) {
		return null;
	}
};

export const getBalance = async ({ address, chainId, token }: IGetBalance) => {
	try {
		if (!address || !chainId) {
			return null;
		}

		const urls = Object.values(rpcUrls[chainId] || {});

		if (urls.length === 0) {
			return null;
		}

		const data = await Promise.any(urls.map((rpcUrl) => createProviderAndGetBalance({ rpcUrl, address, token })));

		return data;
	} catch (error) {
		console.log(error);
		return null;
	}
};

export const useBalance = ({
	address,
	chainId,
	token
}): UseQueryResult<{
	value: ethers.BigNumber;
	formatted: string;
	decimals?: undefined;
}> => {
	const { isConnected } = useAccount();

	const tokenAddress = [ethers.constants.AddressZero, nativeAddress.toLowerCase()].includes(token?.toLowerCase())
		? null
		: (token as `0x${string}`);

	const isEnabled = chainId && isConnected && token ? true : false;

	const wagmiData = useWagmiBalance({
		address: address,
		token: tokenAddress,
		watch: true,
		chainId: chainId,
		enabled: isEnabled
	});

	const queryData = useQuery(
		['balance', address, chainId, token, wagmiData.isLoading || wagmiData.data ? false : true],
		() => getBalance({ address, chainId, token }),
		{
			refetchInterval: 10_000,
			enabled: isEnabled && !wagmiData.isLoading && !wagmiData.data
		}
	);

	// when token is undefined/null, wagmi tries fetch users chain token (for ex :ETH) balance, even though is isEnabled is false
	// so hardcode data to null
	return (
		!isEnabled
			? { isLoading: false, isSuccess: false, data: null }
			: wagmiData.isLoading || wagmiData.data
			? wagmiData
			: queryData
	) as UseQueryResult<{
		value: ethers.BigNumber;
		formatted: string;
		decimals?: undefined;
	}>;
};
