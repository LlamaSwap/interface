import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { ABI } from './abi';

// All info collected from reverse engineering https://app.odos.xyz/
export const chainToId = {
	ethereum: 'ethereum',
	polygon: 'polygon',
	arbitrum: 'arbitrum',
	optimism: 'optimism'
};

export const name = 'Odos';
export const token = null;

export function approvalAddress() {
	return '0x3373605b97d079593216a99ceF357C57D1D9648e';
}
const routers = {
	ethereum: '0x76f4eeD9fE41262669D0250b2A97db79712aD855',
	polygon: '0xa32EE1C40594249eb3183c10792BcF573D4Da47C',
	arbitrum: '0xdd94018F54e565dbfc939F7C44a16e163FaAb331',
	optimism: '0x69Dd38645f7457be13571a847FfD905f9acbaF6d'
};

export async function getQuote(chain: string, from: string, to: string, amount: string, extra) {
	const data = await fetch(
		`https://api.llama.fi/dexAggregatorQuote?protocol=${name}&chain=${chain}&from=${from}&to=${to}&amount=${
			+amount / 10 ** extra?.fromToken?.decimals
		}`,
		{
			method: 'POST',
			body: JSON.stringify(extra)
		}
	).then((res) => res.json());

	return {
		...data,
		tokenApprovalAddress: routers[chain],
		amountReturned: BigNumber(data.amountReturned).multipliedBy(BigNumber(10).pow(extra.toToken.decimals)).toFixed(0, 1)
	};
}

export async function swap({ chain, from, to, signer, rawQuote }) {
	const fromAddress = await signer.getAddress();

	const router = new ethers.Contract(routers[chain], ABI.odosRouter, signer);
	const decimalsIn = rawQuote.path.nodes[0].decimals;

	const amountIn = BigNumber(rawQuote.inAmounts[0])
		.multipliedBy(10 ** decimalsIn)
		.toFixed(0, 1);

	const decimalsOut = rawQuote.path.nodes[rawQuote.path.nodes.length - 1].decimals;

	const amountOut = BigNumber(rawQuote.outAmounts[0])
		.multipliedBy(10 ** decimalsOut)
		.toFixed(0, 1);

	const amountSlippage = ((+amountOut / 100) * 99).toFixed(0);
	const executor = rawQuote.inputDests[0];
	const pathBytes = rawQuote.pathDefBytes;

	const tx = await router.swap(
		[[from, amountIn, executor, '0x']],
		[[to, 1, fromAddress]],
		amountOut,
		amountSlippage,
		executor,
		'0x' + pathBytes,
		from === ethers.constants.AddressZero ? { value: amountIn } : {}
	);

	return tx;
}
