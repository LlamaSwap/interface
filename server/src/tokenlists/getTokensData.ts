import { chainIdToName } from './constants';
import { IToken } from './types';
import { getS3, storeJSONString } from './s3';
import { readContract } from 'wagmi/actions';
import { config } from '../WalletProvider';

function makeCalls(chainId:string, abiMethod:any, tokens:string[]){
	return Promise.all(tokens.map(async token=>{
		try{
			const res = await readContract(config, {address: token as `0x${string}`, abi: [abiMethod], functionName: abiMethod.name, args: [], chainId})
			return {
				output: res,
				success: true
			}
		} catch(e){
			return {
				success: false
			}
		}
	}))
}

// use multicall to fetch tokens name, symbol and decimals
export const getTokensData = async ([chainId, tokens]: [string, Array<string>]): Promise<[string, Array<IToken>]> => {
	const filename = `erc20/${chainId}`;
	let storedTokenMetadata;
	try {
		storedTokenMetadata = JSON.parse((await getS3(filename)).body!);
	} catch (e) {
		storedTokenMetadata = {};
	}
	const missingTokens = tokens.filter(
		(token) => token !== '' && storedTokenMetadata[token.toLowerCase()] === undefined && token.length === 42
	);

	const names  = await makeCalls(chainId, {
			constant: true,
			inputs: [],
			name: 'name',
			outputs: [
				{
					name: '',
					type: 'string'
				}
			],
			payable: false,
			stateMutability: 'view',
			type: 'function'
		}, missingTokens);

	const symbols = await makeCalls(chainId, {"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
		missingTokens);

	const decimals = await makeCalls(chainId, {"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},
		missingTokens);

	const data:any[] = [];

	let changed = false;
	missingTokens.forEach((token, i) => {
		const name = names[i];
		const symbol = symbols[i];
		const decimal = decimals[i];

		if (name.success && symbol.success && decimal.success) {
			changed = true;
			storedTokenMetadata[token.toLowerCase()] = {
				name: name.output,
				symbol: symbol.output,
				decimals: decimal.output
			};
		}
	});
	Object.entries(storedTokenMetadata).map(([address, info]: [string, any]) => {
		data.push({
			name: info.name,
			symbol: info.symbol,
			decimals: info.decimals,
			address: address,
			chainId,
			geckoId: null,
			logoURI: null,
			isGeckoToken: true
		});
	});
	if (changed) {
		await storeJSONString(filename, JSON.stringify(storedTokenMetadata));
	}

	return [chainId, data];
};
