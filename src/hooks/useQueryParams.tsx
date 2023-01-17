import { useRouter } from 'next/router';

export function useQueryParams() {
	const router = useRouter();

	const { chain: chainOnURL, from: fromToken, to: toToken, slippage: slippageQuery } = router.query;

	const chainName = typeof chainOnURL === 'string' ? chainOnURL.toLowerCase() : 'ethereum';
	const fromTokenAddress = typeof fromToken === 'string' ? fromToken.toLowerCase() : null;
	const toTokenAddress = typeof toToken === 'string' ? toToken.toLowerCase() : null;
	const slippage = typeof slippageQuery === 'string' && !Number.isNaN(Number(slippageQuery)) ? slippageQuery : '0.5';

	return { chainName, fromTokenAddress, toTokenAddress, slippage };
}
