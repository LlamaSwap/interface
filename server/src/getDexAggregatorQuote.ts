import { adapters } from './dexAggregators/list';

const handler = async (event: AWSLambda.APIGatewayEvent): Promise<any> => {
	const { protocol, chain, from, to, amount } = event.queryStringParameters!;
	const body = JSON.parse(event.body!);
	const agg = adapters.find((ag) => ag.name === protocol);
	if (agg === undefined) {
		return {
			statusCode: 404,
			body: JSON.stringify({ message: 'No DEX Aggregator with that name' }),
			headers: {
				'Cache-Control': `max-age=${3600}`,
				'Access-Control-Allow-Origin': '*'
			}
		};
	}
	const quote = await agg.getQuote(chain!, from!, to!, amount!, body!);
	return {
		statusCode: 200,
		body: JSON.stringify(quote),
		headers: {
			'Cache-Control': `max-age=${10}`,
			'Access-Control-Allow-Origin': '*'
		}
	};
};

export default handler;
