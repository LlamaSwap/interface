import { getTokenList } from './tokenlists/getTokenList';
import { storeJSONString } from './tokenlists/s3';

const handler = async () => {
	try {
		const tokenlists = await getTokenList();
		await storeJSONString('tokenlists.json', JSON.stringify(tokenlists), 3600);
	} catch (e) {
		console.log(e);
		throw e;
	}
};

export default handler;