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
	return chainsOptions;
}

export async function swap({ chain, from, to, amount, signer, slippage = '1', adapter, rawQuote, tokens, route }) {
	const aggregator = adaptersMap[adapter];
	try {
		return await aggregator.swap({
			chain,
			from,
			to,
			amount,
			signer,
			slippage,
			rawQuote,
			tokens,
			route
		});
	} catch (e) {
		throw e;
	}
}
