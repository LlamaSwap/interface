import { BigNumber, ethers } from 'ethers';
import { useState } from 'react';
import { erc20ABI, useAccount, useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi';
import { nativeAddress } from '../constants';

// To change the approve amount you first have to reduce the addresses`
//  allowance to zero by calling `approve(_spender, 0)` if it is not
//  already 0 to mitigate the race condition described here:
//  https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
const oldErc = [
	'0xdAC17F958D2ee523a2206206994597C13D831ec7'.toLowerCase(), // USDT
	'0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32'.toLowerCase() // LDO
];

export const useGetAllowance = (token: string, spender: `0x${string}`, amount: string) => {
	const { address, isConnected } = useAccount();

	const isOld = token ? oldErc.includes(token?.toLowerCase()) : false;

	const {
		data: allowance,
		refetch,
		isRefetching
	} = useContractRead({
		address: token,
		abi: erc20ABI,
		functionName: 'allowance',
		args: [address, spender],
		watch: true,
		enabled: isConnected && !!spender && token !== ethers.constants.AddressZero
	});

	const shouldRemoveApproval =
		isOld &&
		allowance &&
		amount &&
		!Number.isNaN(Number(amount)) &&
		allowance.lt(BigNumber.from(amount)) &&
		!allowance.eq(0);

	return { allowance, shouldRemoveApproval, refetch, isRefetching };
};

export const useTokenApprove = (token: string, spender: `0x${string}`, amount: string) => {
	const [isConfirmingApproval, setIsConfirmingApproval] = useState(false);
	const [isConfirmingInfiniteApproval, setIsConfirmingInfiniteApproval] = useState(false);
	const [isConfirmingResetApproval, setIsConfirmingResetApproval] = useState(false);

	const { address, isConnected } = useAccount();

	const { allowance, shouldRemoveApproval, refetch } = useGetAllowance(token, spender, amount);

	const normalizedAmount = Number(amount) ? amount : '0';

	const { config } = usePrepareContractWrite({
		address: token,
		abi: erc20ABI,
		functionName: 'approve',
		args: [spender, normalizedAmount ? BigNumber.from(normalizedAmount) : ethers.constants.MaxUint256],
		enabled: isConnected && !!spender && !!token
	});

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

	if (!address || !allowance) return { isApproved: false };

	if (allowance.toString() === ethers.constants.MaxUint256.toString()) return { isApproved: true };

	if (normalizedAmount && allowance.gte(BigNumber.from(normalizedAmount))) return { isApproved: true };

	return {
		isApproved: false,
		approve,
		approveInfinite,
		approveReset,
		isLoading: isLoading || isConfirmingApproval,
		isConfirmingApproval,
		isInfiniteLoading: isInfiniteLoading || isConfirmingInfiniteApproval,
		isConfirmingInfiniteApproval,
		isResetLoading: isResetLoading || isConfirmingResetApproval,
		isConfirmingResetApproval,
		allowance,
		shouldRemoveApproval
	};
};
