import { encodeFunctionData } from 'viem';
import { tokenApprovalAbi } from '../constants';

export function getTxs({
	fromAddress,
	toAddress,
	data,
	value,
	fromTokenAddress,
	fromAmount,
	eip5792,
	tokenApprovalAddress
}: {
	fromAddress: `0x${string}`;
	toAddress: `0x${string}`;
	data: `0x${string}`;
	value?: bigint;
	fromTokenAddress?: `0x${string}`;
	fromAmount?: bigint;
	eip5792?: any;
	tokenApprovalAddress?: `0x${string}`;
}) {
	const txObj = {
		from: fromAddress,
		to: toAddress,
		data: data,
		...(value ? { value } : {})
	};

	const txs: any = [];

	if (eip5792 && (eip5792.shouldRemoveApproval || !eip5792.isTokenApproved)) {
		if (!fromTokenAddress) throw new Error('fromTokenAddress is required');
		if (!tokenApprovalAddress) throw new Error('tokenApprovalAddress is required');
		if (!fromAmount) throw new Error('fromAmount is required');
		
		if (eip5792.shouldRemoveApproval) {
			txs.push({
				from: txObj.from,
				to: fromTokenAddress,
				data: encodeFunctionData({
					abi: tokenApprovalAbi,
					functionName: 'approve',
					args: [tokenApprovalAddress, 0n]
				})
			});
		}

		if (!eip5792.isTokenApproved) {
			txs.push({
				from: txObj.from,
				to: fromTokenAddress,
				data: encodeFunctionData({
					abi: tokenApprovalAbi,
					functionName: 'approve',
					args: [tokenApprovalAddress, fromAmount]
				})
			});
		}
	}

	txs.push(txObj);

	return txs;
}
