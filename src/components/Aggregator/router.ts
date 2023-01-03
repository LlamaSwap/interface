import * as matcha from './adapters/0x';
import * as inch from './adapters/1inch';
import * as cowswap from './adapters/cowswap';
// import * as firebird from './adapters/firebird'
import * as kyberswap from './adapters/kyberswap';
import * as openocean from './adapters/openocean';
import * as paraswap from './adapters/paraswap';
import * as lifi from './adapters/lifi';
// import * as rango from './adapters/rango';

// import * as unidex from "./adapters/unidex" - disabled, their api is broken
// import * as airswap from './adapters/airswap' cors
// import * as odos from './adapters/odos';
import * as yieldyak from './adapters/yieldyak';
import { capitalizeFirstLetter } from '~/utils';
import { allChains } from '../WalletProvider/chains';
import { chainNamesReplaced, chainsMap } from './constants';
// import * as krystal from './adapters/krystal'

export const adapters = [matcha, inch, cowswap, kyberswap, openocean, yieldyak];

const adaptersMap = adapters.reduce((acc, adapter) => ({ ...acc, [adapter.name]: adapter }), {});

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
