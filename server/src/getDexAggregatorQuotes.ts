import { adapters } from './dexAggregators/list';

const handler = async (event: AWSLambda.APIGatewayEvent): Promise<any> => {
	const { chain, from, to, amount } = event.queryStringParameters!;
	const body = JSON.parse(event.body!);
	const enabledAggregators = body?.enabledAggregators;
	const enabledAdapters = adapters.filter((agg) => (enabledAggregators ? enabledAggregators.includes(agg.name) : true));
	if (!enabledAdapters.length) {
		return {
			statusCode: 404,
			body: JSON.stringify({ message: 'Aggregators are not selected, but enabledAgregators is provided' }),
			headers: {
				'Cache-Control': `max-age=${3600}`,
				'Access-Control-Allow-Origin': '*'
			}
		};
	}

	const quotes = await Promise.all(
		enabledAdapters.map(async (agg) => await agg.getQuote(chain!, from!, to!, amount!, body!))
	);
	return {
		statusCode: 200,
		body: JSON.stringify(quotes),
		headers: {
			'Cache-Control': `max-age=${10}`,
			'Access-Control-Allow-Origin': '*'
		}
	};
};

export default handler;
