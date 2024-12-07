import { useAccount, useEstimateGas } from 'wagmi';
import { chainsMap, nativeAddress, tokenApprovalAbi } from '../constants';
import { useMutation, useQuery } from '@tanstack/react-query';
import { zeroAddress, erc20Abi, maxInt256, encodeFunctionData } from 'viem';
import { arbitrum, fantom } from 'viem/chains';
import { readContract, waitForTransactionReceipt, writeContract } from 'wagmi/actions';
import { config } from '~/components/WalletProvider';

// To change the approve amount you first have to reduce the addresses`
//  allowance to zero by calling `approve(_spender, 0)` if it is not
//  already 0 to mitigate the race condition described here:
//  https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
const oldErc = [
	'0xdAC17F958D2ee523a2206206994597C13D831ec7'.toLowerCase(), // USDT
	'0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32'.toLowerCase() // LDO
];

const chainsWithDefaultGasLimit = {
	[fantom.id]: true,
	[arbitrum.id]: true
};

async function approveTokenSpend({
	address,
	chain,
	spender,
	amount,
	customGasLimit
}: {
	address?: `0x${string}`;
	chain?: string;
	spender?: `0x${string}`;
	amount: bigint;
	customGasLimit?: { gas: bigint } | null;
}) {
	try {
		if (!address || !spender || !chain) {
			throw new Error('Invalid arguments');
		}

		const hash = await writeContract(config, {
			address,
			abi: tokenApprovalAbi,
			functionName: 'approve',
			args: [spender, amount],
			chainId: chainsMap[chain],
			...(customGasLimit ?? {})
		});

		const receipt = await waitForTransactionReceipt(config, { hash, chainId: chainsMap[chain] });

		return receipt;
	} catch (error) {
		throw new Error(`[TOKEN-APPROVAL]: ${error instanceof Error ? error.message : 'Failed to approve token'}`);
	}
}

const useApproveTokenSpend = () => {
	return useMutation({ mutationFn: approveTokenSpend });
};

async function getAllowance({
	token,
	chain,
	address,
	spender
}: {
	token?: string;
	chain?: string;
	address?: `0x${string}`;
	spender?: `0x${string}`;
}) {
	if (!spender || !token || !address || token === zeroAddress || !chain) {
		return null;
	}
	try {
		const allowance = await readContract(config, {
			address: token as `0x${string}`,
			abi: erc20Abi,
			functionName: 'allowance',
			args: [address, spender],
			chainId: chainsMap[chain]
		});

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
	chain?: string;
}) => {
	const { address } = useAccount();

	const isOld = token ? oldErc.includes(token.toLowerCase()) : false;

	const {
		data: allowance,
		refetch,
		isLoading,
		error: errorFetchingAllowance
	} = useQuery({
		queryKey: ['token-allowance', address, token, chain, spender],
		queryFn: () =>
			getAllowance({
				token,
				chain,
				address,
				spender
			}),
		retry: 2
	});

	const shouldRemoveApproval =
		isOld && allowance && amount && !Number.isNaN(Number(amount)) && allowance < BigInt(amount) && allowance !== 0n;

	return { allowance, shouldRemoveApproval, refetch, isLoading, errorFetchingAllowance };
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
	chain?: string;
}) => {
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

	const encodedFunctionData =
		isConnected && !!spender && !!token && normalizedAmount !== '0'
			? encodeFunctionData({
					abi: tokenApprovalAbi,
					functionName: 'approve',
					args: spender && [spender, normalizedAmount ? BigInt(normalizedAmount) : maxInt256]
				})
			: null;

	const { data: gasLimit } = useEstimateGas({
		to: token,
		data: encodedFunctionData!,
		chainId: chain && chainsMap[chain],
		query: {
			enabled: encodedFunctionData ? true : false
		}
	});

	const customGasLimit =
		shouldRemoveApproval || gasLimit === undefined || !chain || chainsWithDefaultGasLimit[chainsMap[chain]]
			? null
			: { gas: (gasLimit * 140n) / 100n };

	const { mutateAsync: approveWriteContract, isPending: isLoading } = useApproveTokenSpend();
	const approve = () => {
		approveWriteContract({
			address: token,
			spender,
			amount: normalizedAmount ? BigInt(normalizedAmount) : maxInt256,
			chain,
			customGasLimit
		})
			.then(() => {
				refetch();
			})
			.catch((err) => console.log(err));
	};

	const { mutateAsync: approveInfiniteWriteContract, isPending: isInfiniteLoading } = useApproveTokenSpend();
	const approveInfinite = () => {
		approveInfiniteWriteContract({
			address: token,
			spender,
			amount: maxInt256,
			chain,
			customGasLimit
		})
			.then(() => {
				refetch();
			})
			.catch((err) => console.log(err));
	};

	const { mutateAsync: approveResetWriteContract, isPending: isResetLoading } = useApproveTokenSpend();
	const approveReset = () => {
		approveResetWriteContract({
			address: token,
			spender,
			amount: 0n,
			chain,
			customGasLimit
		})
			.then(() => {
				refetch();
			})
			.catch((err) => console.log(err));
	};

	if (token === zeroAddress || token?.toLowerCase() === nativeAddress.toLowerCase()) return { isApproved: true };

	if (!address || (!allowance && allowance !== 0n)) return { isApproved: false, errorFetchingAllowance };

	if (allowance === maxInt256) return { isApproved: true, allowance };

	if (normalizedAmount && allowance >= BigInt(normalizedAmount)) return { isApproved: true, allowance };

	return {
		isApproved: false,
		approve,
		approveInfinite,
		approveReset,
		isLoading: isFetchingAllowance || isLoading,
		isConfirmingApproval: isLoading,
		isInfiniteLoading: isInfiniteLoading,
		isConfirmingInfiniteApproval: isInfiniteLoading,
		isResetLoading: isResetLoading,
		isConfirmingResetApproval: isResetLoading,
		allowance,
		shouldRemoveApproval,
		refetch
	};
};
