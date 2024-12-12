function countBits(inputNum: bigint) {
	let bitlength = 0;
	while (inputNum !== 0n) {
		inputNum = inputNum / 2n;
		bitlength++;
	}
	return bitlength;
}

function removeFirstBit(word: bigint) {
	// To work this requires that word has a number of bits that is multiple of 8 + the starting bit
	return word.toString(16).slice(1);
}

export function encode(
	pair: string,
	token0IsTokenIn: boolean,
	expectedReturnAmount: string,
	slippage: string,
	inputIsETH: boolean,
	maxBalance?: boolean,
	inputAmount?: string
) {
	let word = ((1n << 4n) + BigInt(pair)) << 1n;
	if (token0IsTokenIn) {
		word = word + 1n;
	}
	word = word << 17n;
	let slippageZeroes = 0n;
	let slippageNum = BigInt(expectedReturnAmount);
	while (slippageNum > 131071n) {
		// 0b11111111111111111
		slippageZeroes++;
		slippageNum = slippageNum / 2n;
	}
	if (slippageNum < 131071n) {
		slippageNum = slippageNum + 1n; // round up
	}
	word = ((word + slippageNum) << 8n) + slippageZeroes;

	const slippageId = ['0.5', '0.1', '1', '5'].findIndex((slip) => slip === slippage);
	if (slippageId === -1) {
		throw new Error('Slippage number not supported');
	}
	word = (word << 2n) + BigInt(slippageId);

	if (inputIsETH || maxBalance) {
		return removeFirstBit(word); // pad it so total number of bits is a multiple of 8
	}

	let inputZeroes = 0n;
	let inputNum = BigInt(inputAmount!);
	while ((inputNum % 10n) === 0n && inputNum !== 0n) {
		inputZeroes++;
		inputNum = inputNum / 10n;
	}
	word = (word << 5n) + inputZeroes;
	const inputBitlength = BigInt(countBits(inputNum));
	const extraBits = inputBitlength % 8n;
	word = word << (inputBitlength + (extraBits <= 3n ? 3n - extraBits : 3n + 8n - extraBits));
	return removeFirstBit(word + inputNum);
}
