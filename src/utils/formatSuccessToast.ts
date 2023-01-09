import BigNumber from 'bignumber.js';

export const formatSuccessToast = (variables) => {
	const fromToken = variables.tokens.fromToken;
	const toToken = variables.tokens.toToken;

	const inAmount = variables.rawQuote?.inAmount ?? variables.rawQuote?.inputAmount;
	const outAmount = variables.rawQuote?.outAmount ?? variables.rawQuote?.outputAmount;
	return {
		title: 'Transaction Success',
		description: `Swapped ${
			inAmount
				? BigNumber(inAmount)
						.div(10 ** Number(fromToken.decimals || 18))
						.toFixed(3)
				: ''
		} ${fromToken.symbol} for ${
			outAmount
				? BigNumber(outAmount)
						.div(10 ** Number(toToken.decimals || 18))
						.toFixed(3)
				: ''
		} ${toToken.symbol} via ${variables.adapter}`,
		status: 'success',
		duration: 10000,
		isClosable: true,
		position: 'top-right',
		containerStyle: {
			width: '100%',
			maxWidth: '300px'
		}
	} as const;
};
