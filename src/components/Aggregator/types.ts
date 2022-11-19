export interface ExtraData {
	userAddress: string;
	slippage: string;
}

export interface IGetSwapQuote {
	fromAddress: string;
	chain: string;
	from: string;
	to: string;
	amount: string;
	slippage: string;
}
