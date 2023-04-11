import { adapters } from './dexAggregators/list';

const handler = async (): Promise<any> => {
	const res = adapters.map((agg) => ({ name: agg.name, chains: Object.keys(agg.chainToId) }));

	return {
		statusCode: 200,
		body: JSON.stringify(res),
		headers: {
			'Cache-Control': `max-age=${10}`,
			'Access-Control-Allow-Origin': '*'
		}
	};
};

export default handler;
