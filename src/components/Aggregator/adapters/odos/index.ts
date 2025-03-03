import { sendTx } from '../../utils/sendTx';

// https://api.odos.xyz/info/chains
export const chainToId = {
	ethereum: 1,
	arbitrum: 42161,
	optimism: 10,
	base: 8453,
	polygon: 137,
	avax: 43114,
	bsc: 56,
	fantom: 250,
	zksync: 324,
	//polygonzkevm: 1101
	//mantle
	//mode:
	linea: 59144,
	scroll: 534352,
	sonic: 146
};

export const name = 'Odos';
export const token = 'ODOS';

const referralCode = 2101375859;

// https://docs.odos.xyz/product/sor/v2/
const routers = {
	ethereum: '0xcf5540fffcdc3d510b18bfca6d2b9987b0772559',
	arbitrum: '0xa669e7a0d4b3e4fa48af2de86bd4cd7126be4e13',
	optimism: '0xca423977156bb05b13a2ba3b76bc5419e2fe9680',
	base: '0x19ceead7105607cd444f5ad10dd51356436095a1',
	polygon: '0x4e3288c9ca110bcc82bf38f09a7b425c095d92bf',
	avax: '0x88de50b233052e4fb783d4f6db78cc34fea3e9fc',
	bsc: '0x89b8aa89fdd0507a99d334cbe3c808fafc7d850e',
	fantom: '0xd0c22a5435f4e8e5770c1fafb5374015fc12f7cd',
	zksync: '0x4bBa932E9792A2b917D47830C93a9BC79320E4f7',
	linea: '0x2d8879046f1559E53eb052E949e9544bCB72f414',
	scroll: '0xbFe03C9E20a9Fc0b37de01A172F207004935E0b1',
	sonic: '0xac041df48df9791b0654f1dbbf2cc8450c5f2e9d',
	//polygonzkevm: '0x2b8B3f0949dfB616602109D2AAbBA11311ec7aEC'
};

export function approvalAddress(chain) {
	return routers[chain];
}

export async function getQuote(chain: string, from: string, to: string, amount: string, extra) {
	const quote = await fetch(`https://api.odos.xyz/sor/quote/v2`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			chainId: chainToId[chain],
			inputTokens: [
				{
					tokenAddress: from,
					amount: amount
				}
			],
			outputTokens: [
				{
					tokenAddress: to,
					proportion: 1
				}
			],
			userAddr: extra.userAddress, // checksummed user address
			slippageLimitPercent: extra.slippage, // set your slippage limit percentage (1 = 1%),
			referralCode,
			// optional:
			disableRFQs: true,
			compact: true
		})
	}).then((res) => res.json());

	const swapData = await fetch('https://api.odos.xyz/sor/assemble', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			userAddr: extra.userAddress, // the checksummed address used to generate the quote
			pathId: quote.pathId // Replace with the pathId from quote response in step 1
			//simulate: true // this can be set to true if the user isn't doing their own estimate gas call for the transaction
		})
	}).then((res) => res.json());

	if (swapData.transaction.to.toLowerCase() !== routers[chain].toLowerCase()) {
		throw new Error(`Router address does not match`);
	}

	return {
		amountReturned: swapData.outputTokens[0].amount,
		estimatedGas: swapData.transaction.gas <= 0 ? swapData.gasEstimate : swapData.transaction.gas,
		rawQuote: swapData,
		tokenApprovalAddress: routers[chain]
	};
}

export async function swap({ rawQuote }) {
	const tx = await sendTx({
		from: rawQuote.transaction.from,
		to: rawQuote.transaction.to,
		data: rawQuote.transaction.data,
		value: rawQuote.transaction.value
		//gas: rawQuote.transaction.gas
	});

	return tx;
}

export const getTxData = ({ rawQuote }) => rawQuote?.transaction.data;

export const getTx = ({ rawQuote }) => ({
	to: rawQuote.transaction.to,
	data: rawQuote.transaction.data,
	value: rawQuote.transaction.value
});
