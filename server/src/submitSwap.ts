import { adapters } from './Aggregator/list';

const handler = async (event: AWSLambda.APIGatewayEvent): Promise<any> => {
	const { protocol, chain } = event.queryStringParameters!;
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
	if (!(agg as any).submitSwap) {
		return {
			statusCode: 400,
			body: JSON.stringify({ message: "Aggregator doesn't support submitting swap" }),
			headers: {
				'Cache-Control': `max-age=${3600}`,
				'Access-Control-Allow-Origin': '*'
			}
		};
	}
	const res = await (agg as any).submitSwap({ chain, body });
	return {
		statusCode: 200,
		body: JSON.stringify(res),
		headers: {
			'Access-Control-Allow-Origin': '*'
		}
	};
};

export default handler;
