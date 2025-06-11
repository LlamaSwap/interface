import { getTokenList } from './tokenlists/getTokenList';
import { storeJSONString } from './tokenlists/s3';

const handler = async () => {
	try {
		const tokenlists = await getTokenList();
		await storeJSONString('tokenlists.json', JSON.stringify(tokenlists), 3600);
		// store token list by chain
		for (const chain in tokenlists) {
			const list = {};
			for (const token of tokenlists[chain]) {
				list[token.address] = token;
			}
			await storeJSONString(`tokenlists-${chain}.json`, JSON.stringify(list), 3600);
		}
	} catch (e) {
		console.log(e);
		throw e;
	}
};

export default handler;
