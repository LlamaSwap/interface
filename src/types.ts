export interface IToken {
	address: string;
	logoURI: string;
	symbol: string;
	decimals: string;
	name: string;
	chainId: number;
	amount?: string;
	balanceUSD?: number;
}
