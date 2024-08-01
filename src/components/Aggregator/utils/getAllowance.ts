import { ethers } from 'ethers';
import { providers } from '../rpcs';

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
	chain: string;
	address?: `0x${string}`;
	spender?: `0x${string}`;
}) {
	if (!spender || !token || !address || token === ethers.constants.AddressZero) {
		return null;
	}
	try {
		const provider = providers[chain];
		const tokenContract = new ethers.Contract(
			token,
			[
				{
					type: 'function',
					name: 'allowance',
					stateMutability: 'view',
					inputs: [
						{
							name: 'owner',
							type: 'address'
						},
						{
							name: 'spender',
							type: 'address'
						}
					],
					outputs: [
						{
							type: 'uint256'
						}
					]
				}
			],
			provider
		);
		const allowance = await tokenContract.allowance(address, spender);
		return allowance;
	} catch (error) {
		throw new Error(error instanceof Error ? `[Allowance]:${error.message}` : '[Allowance]: Failed to fetch allowance');
	}
}
