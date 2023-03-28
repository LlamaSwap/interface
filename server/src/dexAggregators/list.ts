import * as matcha from './adapters/0x';
import * as inch from './adapters/1inch';
import * as cowswap from './adapters/cowswap';
import * as firebird from './adapters/firebird';
import * as kyberswap from './adapters/kyberswap';
import * as hashflow from './adapters/hashflow';
import * as openocean from './adapters/openocean';
import * as paraswap from './adapters/paraswap';
import * as yieldyak from './adapters/yieldyak';
import * as llamazip from './adapters/llamazip';

export const allDexAggregators = [
	matcha,
	inch,
	cowswap,
	openocean,
	yieldyak,
	paraswap,
	firebird,
	hashflow,
	llamazip,
	kyberswap
];
