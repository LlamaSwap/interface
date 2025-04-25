import { IToken } from './types';
import { getS3, storeJSONString } from './s3';
import { createPublicClient, erc20Abi } from 'viem';
import { allChains } from '../WalletProvider/chains';
import { rpcsTransports } from '../Aggregator/rpcs';

export const getTokensData = async ([chainId, tokens]: [string, Array<string>]): Promise<[string, Array<IToken>]> => {
	const filename = `erc20/${chainId}`;
	let storedTokenMetadata;
	try {
		storedTokenMetadata = { ...JSON.parse((await getS3(filename)).body!) };
	} catch (e) {
		storedTokenMetadata = {};
	}

	const missingTokens = tokens.filter(
		(token) => token !== '' && storedTokenMetadata[token.toLowerCase()] === undefined && token.length === 42
	);

	try {
		const chain = allChains.find((c) => c.id === +chainId);

		if (!chain) {
			throw new Error(`Chain ${chainId} not found`);
		}

		const publicClient = createPublicClient({
			chain,
			transport: rpcsTransports[chainId],
			batch: {
				multicall: {
					wait: 5_000
				}
			}
		});

		const names = await publicClient.multicall({
			contracts: missingTokens.map((token) => ({
				address: token as `0x${string}`,
				abi: erc20Abi,
				functionName: 'name'
			})),
			allowFailure: true
		});

		const symbols = await publicClient.multicall({
			contracts: missingTokens.map((token) => ({
				address: token as `0x${string}`,
				abi: erc20Abi,
				functionName: 'symbol'
			})),
			allowFailure: true
		});

		const decimals = await publicClient.multicall({
			contracts: missingTokens.map((token) => ({
				address: token as `0x${string}`,
				abi: erc20Abi,
				functionName: 'decimals'
			})),
			allowFailure: true
		});

		const data: any[] = [];
		let changed = false;
		missingTokens.forEach((token, i) => {
			const name = names[i];
			const symbol = symbols[i];
			const decimal = decimals[i];

			if (name.status === 'success' && symbol.status === 'success' && decimal.status === 'success') {
				changed = true;
				storedTokenMetadata[token.toLowerCase()] = {
					name: name.result,
					symbol: symbol.result,
					decimals: decimal.result
				};
			}
		});

		tokens.forEach((address) => {
			const info = storedTokenMetadata[address.toLowerCase()];
			if (info) {
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
			} else {
				console.log(`[ERROR] [TokensMetaData] ${chainId} ${address} not found`);
			}
		});

		if (changed) {
			await storeJSONString(filename, JSON.stringify(storedTokenMetadata));
		}

		return [chainId, data];
	} catch (error) {
		console.log(`[ERROR] [GetTokensData] ${chainId} ${error}`);
		return [chainId, []];
	}
};
