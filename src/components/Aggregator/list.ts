import * as matcha from './adapters/0x';
import * as inch from './adapters/1inch';
import * as cowswap from './adapters/cowswap';
import * as firebird from './adapters/firebird';
import * as kyberswap from './adapters/kyberswap';
import * as hashflow from './adapters/hashflow';
import * as openocean from './adapters/openocean';
import * as paraswap from './adapters/paraswap';
// import * as lifi from './adapters/lifi';
// import * as rango from './adapters/rango';

// import * as unidex from "./adapters/unidex" - disabled, their api is broken
// import * as airswap from './adapters/airswap' cors
// import * as odos from './adapters/odos';
import * as yieldyak from './adapters/yieldyak';
import * as llamazip from './adapters/llamazip';
// import * as krystal from './adapters/krystal'

export const adapters = [matcha, inch, cowswap, openocean, yieldyak, paraswap, firebird, hashflow, llamazip, kyberswap];

export const inifiniteApprovalAllowed = [matcha.name, inch.name, cowswap.name, kyberswap.name, paraswap.name];

export const adaptersWithApiKeys = {
	[matcha.name]: true,
	[hashflow.name]: true,
	[inch.name]: true
};
