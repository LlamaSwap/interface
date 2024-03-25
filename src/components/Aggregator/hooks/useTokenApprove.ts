import { BigNumber, ethers } from 'ethers';
import { useState } from 'react';
import { erc20ABI, useAccount, useContractWrite, useNetwork, usePrepareContractWrite } from 'wagmi';
import { nativeAddress } from '../constants';
import { providers } from '../rpcs';
import { useQuery } from '@tanstack/react-query';

// To change the approve amount you first have to reduce the addresses`
//  allowance to zero by calling `approve(_spender, 0)` if it is not
//  already 0 to mitigate the race condition described here:
//  https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
const oldErc = [
	'0xdAC17F958D2ee523a2206206994597C13D831ec7'.toLowerCase(), // USDT
	'0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32'.toLowerCase() // LDO
];

const chainsWithDefaltGasLimit = {
	fantom: true,
	arbitrum: true
};

async function getAllowance({
	token,
	chain,
	address,
	spender
}: {
	token?: string;
	chain: string;
	address?: `0x${string}`;
	spender?: `0x${string}`;
}) {
	if (!spender || !token || !address || token === ethers.constants.AddressZero) {
		return null;
	}
	try {
		const provider = providers[chain];
		const tokenContract = new ethers.Contract(token, erc20ABI, provider);
		const allowance = await tokenContract.allowance(address, spender);
		return allowance;
	} catch (error) {
		throw new Error(error instanceof Error ? `[Allowance]:${error.message}` : '[Allowance]: Failed to fetch allowance');
	}
}

const useGetAllowance = ({
	token,
	spender,
	amount,
	chain
}: {
	token?: `0x${string}`;
	spender?: `0x${string}`;
	amount?: string;
	chain: string;
}) => {
	const { address } = useAccount();

	const isOld = token ? oldErc.includes(token?.toLowerCase()) : false;

	const {
		data: allowance,
		refetch,
		isLoading,
		error: errorFetchingAllowance
	} = useQuery(
		['token-allowance', address, token, chain, spender],
		() =>
			getAllowance({
				token,
				chain,
				address,
				spender
			}),
		{ retry: 2 }
	);

	const shouldRemoveApproval =
		isOld &&
		allowance &&
		amount &&
		!Number.isNaN(Number(amount)) &&
		allowance.lt(BigNumber.from(amount)) &&
		!allowance.eq(0);

	return { allowance, shouldRemoveApproval, refetch, isLoading, errorFetchingAllowance };
};

const setOverrides = (func, overrides) => {
	if (!overrides) return func;

	return () => func({ recklesslySetUnpreparedOverrides: overrides });
};

export const useTokenApprove = ({
	token,
	spender,
	amount,
	chain
}: {
	token?: `0x${string}`;
	spender?: `0x${string}`;
	amount?: string;
	chain: string;
}) => {
	const [isConfirmingApproval, setIsConfirmingApproval] = useState(false);
	const [isConfirmingInfiniteApproval, setIsConfirmingInfiniteApproval] = useState(false);
	const [isConfirmingResetApproval, setIsConfirmingResetApproval] = useState(false);
	const network = useNetwork();

	const { address, isConnected } = useAccount();

	const {
		allowance,
		shouldRemoveApproval,
		refetch,
		isLoading: isFetchingAllowance,
		errorFetchingAllowance
	} = useGetAllowance({
		token,
		spender,
		amount,
		chain
	});

	const normalizedAmount = !Number.isNaN(Number(amount)) ? amount : '0';

	const { config, data } = usePrepareContractWrite({
		address: token,
		abi: erc20ABI,
		functionName: 'approve',
		args: [spender, normalizedAmount ? BigNumber.from(normalizedAmount) : ethers.constants.MaxUint256],
		enabled: isConnected && !!spender && !!token && normalizedAmount !== '0'
	});

	const customGasLimit =
		shouldRemoveApproval || !data?.request?.gasLimit || chainsWithDefaltGasLimit[network.chain.network]
			? null
			: { gasLimit: data?.request?.gasLimit.mul(140).div(100) };

	const { config: configInfinite } = usePrepareContractWrite({
		address: token,
		abi: erc20ABI,
		functionName: 'approve',
		args: [spender, ethers.constants.MaxUint256],
		enabled: isConnected && !!spender && !!token
	});

	const { config: configReset } = usePrepareContractWrite({
		address: token,
		abi: erc20ABI,
		functionName: 'approve',
		args: [spender, BigNumber.from('0')],
		enabled: isConnected && !!spender && !!token && shouldRemoveApproval
	});

	const { write: approve, isLoading } = useContractWrite({
		...config,
		onSuccess: (data) => {
			setIsConfirmingApproval(true);

			data
				.wait()
				.then(() => {
					refetch();
				})
				.catch((err) => console.log(err))
				.finally(() => {
					setIsConfirmingApproval(false);
				});
		}
	});

	const { write: approveInfinite, isLoading: isInfiniteLoading } = useContractWrite({
		...configInfinite,
		onSuccess: (data) => {
			setIsConfirmingInfiniteApproval(true);

			data
				.wait()
				.then(() => {
					refetch();
				})
				.catch((err) => console.log(err))
				.finally(() => {
					setIsConfirmingInfiniteApproval(false);
				});
		}
	});

	const { write: approveReset, isLoading: isResetLoading } = useContractWrite({
		...configReset,
		onSuccess: (data) => {
			setIsConfirmingResetApproval(true);

			data
				.wait()
				.then(() => {
					refetch();
				})
				.catch((err) => console.log(err))
				.finally(() => {
					setIsConfirmingResetApproval(false);
				});
		}
	});

	if (token === ethers.constants.AddressZero || token?.toLowerCase() === nativeAddress.toLowerCase())
		return { isApproved: true };

	if (!address || !allowance) return { isApproved: false, errorFetchingAllowance };

	if (allowance.toString() === ethers.constants.MaxUint256.toString()) return { isApproved: true, allowance };

	if (normalizedAmount && allowance.gte(BigNumber.from(normalizedAmount))) return { isApproved: true, allowance };

	return {
		isApproved: false,
		approve: setOverrides(approve, customGasLimit),
		approveInfinite: setOverrides(approveInfinite, customGasLimit),
		approveReset: setOverrides(approveReset, customGasLimit),
		isLoading: isFetchingAllowance || isLoading || isConfirmingApproval,
		isConfirmingApproval,
		isInfiniteLoading: isInfiniteLoading || isConfirmingInfiniteApproval,
		isConfirmingInfiniteApproval,
		isResetLoading: isResetLoading || isConfirmingResetApproval,
		isConfirmingResetApproval,
		allowance,
		shouldRemoveApproval,
		refetch
	};
};
