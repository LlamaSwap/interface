import { encodeFunctionData } from 'viem';
import { tokenApprovalAbi } from '../constants';

export function getTxs({
	fromAddress,
	toAddress,
	data,
	value,
	fromTokenAddress,
	fromAmount,
	eip5792
}: {
	fromAddress: `0x${string}`;
	toAddress: `0x${string}`;
	data: `0x${string}`;
	value?: bigint;
	fromTokenAddress: `0x${string}`;
	fromAmount: bigint;
	eip5792: any;
}) {
	const txObj = {
		from: fromAddress,
		to: toAddress,
		data: data,
		...(value ? { value } : {})
	};

	const txs: any = [];

	if (eip5792 && (eip5792.shouldRemoveApproval || !eip5792.isTokenApproved)) {
		if (eip5792.shouldRemoveApproval) {
			txs.push({
				from: txObj.from,
				to: fromTokenAddress,
				data: encodeFunctionData({
					abi: tokenApprovalAbi,
					functionName: 'approve',
					args: [txObj.to, 0n]
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
					args: [txObj.to, fromAmount]
				})
			});
		}
	}

	txs.push(txObj);

	return txs;
}
