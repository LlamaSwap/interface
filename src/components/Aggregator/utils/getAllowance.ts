import { erc20Abi, zeroAddress } from 'viem';
import { readContract } from 'wagmi/actions';
import { config } from '~/components/WalletProvider';
import { chainsMap } from '../constants';

// To change the approve amount you first have to reduce the addresses`
//  allowance to zero by calling `approve(_spender, 0)` if it is not
//  already 0 to mitigate the race condition described here:
//  https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
export const oldErc = [
	'0xdAC17F958D2ee523a2206206994597C13D831ec7'.toLowerCase(), // USDT
	'0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32'.toLowerCase() // LDO
];

export async function getAllowance({
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
