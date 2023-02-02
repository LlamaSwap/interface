export const redirectQuoteReq = async (
	protocol: string,
	chain: string,
	from: string,
	to: string,
	amount: string,
	extra: any
) => {
	// TODO: Add lambda url
	const api = process.env.LAMBDA_URL
		? `${process.env.LAMBDA_URL}/dexAggregatorQuote`
		: 'http://localhost:3001/prod/dexAggregatorQuote';

	const data = await fetch(`${api}/?protocol=${protocol}&chain=${chain}&from=${from}&to=${to}&amount=${amount}`, {
		method: 'POST',
		body: JSON.stringify(extra)
	}).then((res) => res.json());

	return data;
};

interface SwapEvent {
	user: string;
	aggregator: string;
	isError: boolean;
	chain: string;
	from: string;
	to: string;
	quote: any;
	txUrl: string;
	amount: string;
	errorData: any;
	amountUsd: number;
	slippage: string;
	routePlace: string;
}

export const sendSwapEvent = async (event: SwapEvent) => {
	const data = await fetch(`https://api.llama.fi/storeAggregatorEvent`, {
		method: 'POST',
		body: JSON.stringify(event)
	}).then((res) => res.json());

	return data;
};
