import BigNumber from 'bignumber.js';

export const formatSuccessToast = (variables) => {
	const fromToken = variables.tokens.fromToken;
	const toToken = variables.tokens.toToken;

	const inAmount = variables.rawQuote?.inAmount ?? variables.rawQuote?.inputAmount ?? variables.rawQuote?.sellAmount;
	const outAmount = variables.rawQuote?.outAmount ?? variables.rawQuote?.outputAmount ?? variables.rawQuote?.buyAmount;
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

const SLIPPAGE_ERRORS = [
	'<minTotalAmountOut',
	'ERR_LIMIT_OUT',
	'Return amount is not enough',
	'Received amount of tokens are less then expected'
];

export const formatErrorToast = (error, isFailed = false) => {
	const isSlippage = SLIPPAGE_ERRORS.some((text) => error?.reason?.includes(text));
	let errorMsg = 'Something went wrong';

	if (isFailed) errorMsg = 'Transaction Failed';
	else if (isSlippage) errorMsg = 'Slippage is too low, try again with higher slippage';
	else if (error?.reason) errorMsg = error.reason;

	return {
		title: 'Transaction Failed',
		description: errorMsg,
		status: 'error',
		duration: 10000,
		isClosable: true,
		position: 'top-right',
		containerStyle: {
			width: '100%',
			maxWidth: '300px'
		}
	} as const;
};

export const formatUnknownErrorToast = ({ title, message }) => {
	return {
		title: title,
		description: message,
		status: 'error',
		duration: 10000,
		isClosable: true,
		position: 'top-right',
		containerStyle: {
			width: '100%',
			maxWidth: '300px'
		}
	} as const;
};

export const formatSubmittedToast = (variables) => {
	const fromToken = variables.tokens.fromToken;
	const toToken = variables.tokens.toToken;

	const inAmount = variables.rawQuote?.inAmount ?? variables.rawQuote?.inputAmount ?? variables.rawQuote?.sellAmount;
	const outAmount = variables.rawQuote?.outAmount ?? variables.rawQuote?.outputAmount ?? variables.rawQuote?.buyAmount;
	return {
		title: 'Transaction Submitted',
		description: `Swap ${
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
