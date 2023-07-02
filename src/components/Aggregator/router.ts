import { allChains } from '../WalletProvider/chains';
import { chainNamesReplaced, chainsMap } from './constants';
import { adapters } from './list';

export const adaptersNames = adapters.map(({ name }) => name);

const adaptersMap = adapters.reduce((acc, adapter) => ({ ...acc, [adapter.name]: adapter }), {});

export function getAllChains() {
	const chains = new Set<string>();
	for (const adapter of adapters) {
		Object.keys(adapter.chainToId).forEach((chain) => chains.add(chain));
	}
	const chainsArr = Array.from(chains);

	const chainsOptions = chainsArr.map((c) => {
		const chain = allChains.find(({ id }) => id === chainsMap[c]);
		return {
			value: c,
			label: chainNamesReplaced[c] ?? chain.name,
			chainId: chainsMap[c],
			logoURI: chain?.iconUrl
		};
	});

	return chainsOptions;
}

export async function swap({ chain, from, to, amount, signer, slippage = '1', adapter, rawQuote, tokens }) {
	const aggregator = adaptersMap[adapter];

	try {
		const res = await aggregator.swap({
			chain,
			from,
			to,
			amount,
			signer,
			slippage,
			rawQuote,
			tokens
		});
		return res;
	} catch (e) {
		throw e;
	}
}
