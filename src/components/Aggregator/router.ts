import { allChains } from '../WalletProvider/chains';
import { chainNamesReplaced } from './constants';
import { adapters } from './list';

export const adaptersNames = adapters.map(({ name }) => name);

const adaptersMap = adapters.reduce((acc, adapter) => ({ ...acc, [adapter.name]: adapter }), {});

export function getAllChains() {
	const chains = new Set<string>();
	for (const adapter of adapters) {
		Object.keys(adapter.chainToId).forEach((chain) => chains.add(chain));
	}

	const chainsOptions = allChains
		.map((c) => {
			const isVisible = chains.has(c.network);
			if (!isVisible) return null;
			return {
				value: c.network,
				label: chainNamesReplaced[c.network] ?? c.name,
				chainId: c.id,
				logoURI: c?.iconUrl
			};
		})
		.filter(Boolean);
	return chainsOptions as Array<{
		value: string;
		label: string;
		chainId: number;
		logoURI?: string | null;
	}>;
}

export async function swap({
	chain,
	from,
	to,
	amount,
	fromAddress,
	slippage = '1',
	adapter,
	rawQuote,
	tokens,
	approvalData
}) {
	const aggregator = adaptersMap[adapter];

	try {
		const res = await aggregator.swap({
			chain,
			from,
			to,
			amount,
			fromAddress,
			slippage,
			rawQuote,
			tokens,
			approvalData
		});
		return res;
	} catch (e) {
		throw e;
	}
}
export async function gaslessApprove({ adapter, rawQuote, isInfiniteApproval }) {
	const aggregator = adaptersMap[adapter];

	if (!aggregator.gaslessApprove) return;

	try {
		const res = await aggregator.gaslessApprove({
			rawQuote,
			isInfiniteApproval
		});
		return res;
	} catch (e) {
		throw e;
	}
}
