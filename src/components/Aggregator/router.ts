import { capitalizeFirstLetter } from '~/utils';
import { allChains } from '../WalletProvider/chains';
import { chainNamesReplaced, chainsMap } from './constants';
import { adapters } from './list';

export const adaptersNames = adapters.map(({ name }) => name);

export const adaptersMap = adapters.reduce((acc, adapter) => ({ ...acc, [adapter.name]: adapter }), {});

export function getAllChains() {
	const chains = new Set<string>();
	for (const adapter of adapters) {
		Object.keys(adapter.chainToId).forEach((chain) => chains.add(chain));
	}
	const chainsArr = Array.from(chains);

	const chainsOptions = chainsArr.map((c) => ({
		value: c,
		label: chainNamesReplaced[c] ?? capitalizeFirstLetter(c),
		chainId: chainsMap[c],
		logoURI: allChains.find(({ id }) => id === chainsMap[c])?.iconUrl
	}));

	return chainsOptions;
}

export async function swap({
	chain,
	from,
	to,
	amount,
	signer,
	slippage = '1',
	adapter,
	rawQuote,
	onError = undefined
}) {
	const aggregator = adaptersMap[adapter];

	try {
		const res = await aggregator.swap({
			chain,
			from,
			to,
			amount,
			signer,
			slippage,
			rawQuote
		});
		return res;
	} catch (e) {
		if (onError && (e.code !== 'ACTION_REJECTED' || e.code.toString() === '-32603')) {
			onError();
		}
		throw e;
	}
}
