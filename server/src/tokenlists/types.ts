export interface IToken {
	address: string;
	label: string;
	value: string;
	logoURI: string;
	logoURI2?: string | null;
	symbol: string;
	decimals: number;
	name: string;
	chainId: number;
	amount?: string | number;
	balanceUSD?: number;
	geckoId: string | null;
	isGeckoToken?: boolean;
}
