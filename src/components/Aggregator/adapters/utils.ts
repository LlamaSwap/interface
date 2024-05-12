export const redirectQuoteReq = async (
	protocol: string,
	chain: string,
	from: string,
	to: string,
	amount: string,
	extra: any
) => {
	const data = await fetch(
		`https://swap-api.defillama.com/dexAggregatorQuote?protocol=${encodeURIComponent(
			protocol
		)}&chain=${chain}&from=${from}&to=${to}&amount=${amount}&api_key=nsr_UYWxuvj1hOCgHxJhDEKZ0g30c4Be3I5fOMBtFAA`,
		{
			method: 'POST',
			body: JSON.stringify(extra)
		}
	).then((res) => res.json());

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
	route: any;
	reportedOutput?: number;
	realOutput?: number;
}

export const sendSwapEvent = async (event: SwapEvent) => {
	const data = await fetch(`https://llamaswap-stats.llama.fi/saveEvent`, {
		method: 'POST',
		body: JSON.stringify(event)
	}).then((res) => res.json());

	return data;
};
