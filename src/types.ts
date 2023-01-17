export interface IToken {
	address: string;
	logoURI: string;
	symbol: string;
	decimals: number;
	name: string;
	chainId: number;
	amount?: string;
	balanceUSD?: number;
	geckoId: string | null;
	isGeckoToken?: boolean;
}
