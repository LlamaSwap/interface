import { BigNumber, ethers } from 'ethers';
import { erc20ABI, useAccount, useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi';
import { nativeAddress } from '../constants';

// To change the approve amount you first have to reduce the addresses`
//  allowance to zero by calling `approve(_spender, 0)` if it is not
//  already 0 to mitigate the race condition described here:
//  https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
const oldErc = [
	'0xdAC17F958D2ee523a2206206994597C13D831ec7'.toLowerCase() // USDT
];

export const useTokenApprove = (token: string, spender: `0x${string}`, amount) => {
	const { address, isConnected } = useAccount();
	const isOld = oldErc.includes(token?.toLowerCase());

	const { data: allowance } = useContractRead({
		address: token,
		abi: erc20ABI,
		functionName: 'allowance',
		args: [address, spender],
		watch: true,
		enabled: isConnected && !!spender && token !== ethers.constants.AddressZero
	});

	const shouldRemoveApproval = isOld && allowance && allowance.lt(BigNumber.from(amount)) && !allowance.eq(0);

	const normalizedAmount = Number(amount) ? amount : '0';
	const { config } = usePrepareContractWrite({
		address: token,
		abi: erc20ABI,
		functionName: 'approve',
		args: [
			spender,
			shouldRemoveApproval
				? BigNumber.from('0')
				: normalizedAmount
				? BigNumber.from(normalizedAmount)
				: ethers.constants.MaxUint256
		],
		enabled: isConnected && !!spender && !!token
	});

	const { config: configInfinite } = usePrepareContractWrite({
		address: token,
		abi: erc20ABI,
		functionName: 'approve',
		args: [spender, shouldRemoveApproval ? BigNumber.from('0') : ethers.constants.MaxUint256],
		enabled: isConnected && !!spender && !!token
	});

	const { write: approve, isLoading } = useContractWrite(config);
	const { write: approveInfinite, isLoading: isInfiniteLoading } = useContractWrite(configInfinite);

	if (token === ethers.constants.AddressZero || token?.toLowerCase() === nativeAddress.toLowerCase())
		return { isApproved: true };

	if (!address || !allowance) return { isApproved: false };
	if (allowance.toString() === ethers.constants.MaxUint256.toString()) return { isApproved: true };

	if (normalizedAmount && allowance.gte(BigNumber.from(normalizedAmount))) return { isApproved: true };

	return { isApproved: false, approve, approveInfinite, isLoading, isInfiniteLoading };
};
