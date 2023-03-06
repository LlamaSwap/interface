import { BigNumber } from 'ethers';

const nativeToken = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

const chainIdToId = {
	ethereum: 1,
	bsc: 56,
	polygon: 137,
	optimism: 10,
	arbitrum: 42161,
	avax: 43114,
	fantom: 250
};

export const chainToApiId = {
	ethereum: 'https://ethereum.conveyor.finance/',
	bsc: 'https://bsc.conveyor.finance/',
	polygon: 'https://polygon.conveyor.finance/',
	optimism: 'https://optimism.conveyor.finance/',
	arbitrum: 'https://arbitrum.conveyor.finance/',
	avax: 'https://avalanche.conveyor.finance/',
	fantom: 'https://fantom.conveyor.finance/'
};

const conveyorSwapAggregatorAddress = {
	1: '0x9536e7Ad58006610eCE944B98a8768d9480a6176',
	56: '0xCd1BA99aF51CcFcffdEa7F466D6A8D5AF81c5e6E',
	137: '0x001DC0C386E020b526a17C30c1ACB93f49B1236e',
	10: '0x6F7413E93F4221048eB51C10645C7377d5750eb3',
	42161: '0xD9230DFA9ee25E007173C4b409F19B516b83066d',
	43114: '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7',
	250: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83'
};

export async function getQuote(chain: string, from: string, to: string, amount: string, extra) {
	const data = await fetch(chainToApiId[chain], {
		method: 'POST',
		body: JSON.stringify({
			token_in: from,
			token_out: to,
			amount_in: amount,
			chain_id: chainIdToId[chain],
			from_address: extra.userAddress ?? '0x0000000000000000000000000000000000000000',
			token_to_eth: to === nativeToken
		}),

		headers: {
			'Content-Type': 'application/json'
		}
	}).then((r) => r.json());

	const gasEstimate = BigNumber.from('200000');

	return {
		amountReturned: data.amount_out,
		estimateGas: gasEstimate.toString(),
		tokenApprovalAddress: conveyorSwapAggregatorAddress[chainIdToId[chain]],
		rawQuote: {
			...data,
			gasLimit: gasEstimate.toString(),
			tx: { ...data?.tx_calldata }
		}
	};
}
