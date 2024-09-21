import { BigNumber } from 'ethers';

function countBits(num: BigNumber) {
	let bitlength = 0;
	let inputNum = BigNumber.from(num);
	while (!inputNum.isZero()) {
		inputNum = inputNum.div(2);
		bitlength++;
	}
	return bitlength;
}

function removeFirstBit(word: BigNumber) {
	// To work this requires that word has a number of bits that is multiple of 8 + the starting bit
	return word.toHexString().replace('0x01', '0x'); // toHexString() normalizes to byte length, so we need to remove 2 nibbles
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
	let word = BigNumber.from(1).shl(4).add(pair).shl(1);
	if (token0IsTokenIn) {
		word = word.add(1);
	}
	word = word.shl(17);
	let slippageZeroes = 0;
	let slippageNum = BigNumber.from(expectedReturnAmount);
	while (slippageNum.gt(131071)) {
		// 0b11111111111111111
		slippageZeroes++;
		slippageNum = slippageNum.div(2);
	}
	if (slippageNum.lt(131071)) {
		slippageNum = slippageNum.add(1); // round up
	}
	word = word.add(slippageNum).shl(8).add(slippageZeroes);

	const slippageId = ['0.5', '0.1', '1', '5'].findIndex((slip) => slip === slippage);
	if (slippageId === -1) {
		throw new Error('Slippage number not supported');
	}
	word = word.shl(2).add(slippageId);

	if (inputIsETH || maxBalance) {
		return removeFirstBit(word); // pad it so total number of bits is a multiple of 8
	}

	let inputZeroes = 0;
	let inputNum = BigNumber.from(inputAmount);
	while (inputNum.mod(10).isZero() && !inputNum.isZero()) {
		inputZeroes++;
		inputNum = inputNum.div(10);
	}
	word = word.shl(5).add(inputZeroes);
	const inputBitlength = countBits(inputNum);
	const extraBits = inputBitlength % 8;
	word = word.shl(inputBitlength + (extraBits <= 3 ? 3 - extraBits : 3 + 8 - extraBits));
	return removeFirstBit(word.add(inputNum));
}

export function encode2(
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
	word = BigInt(String(BigNumber.from(String(word << 2n)).add(slippageId)));

	if (inputIsETH || maxBalance) {
		return removeFirstBit(BigNumber.from(word)); // pad it so total number of bits is a multiple of 8
	}

	let inputZeroes = 0n;
	let inputNum = BigInt(inputAmount ?? 0n);
	while (inputNum % 10n === 0n && inputNum !== 0n) {
		inputZeroes++;
		inputNum = inputNum / 10n;
	}
	word = (word << 5n) + inputZeroes;
	const inputBitlength = BigInt(countBits(BigNumber.from(String(inputNum))));
	const extraBits = inputBitlength % 8n;
	word = word << (inputBitlength + (extraBits <= 3n ? 3n - extraBits : 3n + 8n - extraBits));
	return removeFirstBit(BigNumber.from(String(word + inputNum)));
}
