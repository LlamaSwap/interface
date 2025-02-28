import React, { useState } from 'react';
import { Flex, Input, Text, Button, Box, FlexProps, InputProps, TextProps, ButtonProps } from '@chakra-ui/react';
import BigNumber from 'bignumber.js';
import type { Dispatch, SetStateAction } from 'react';
import type { IToken } from '~/types';
import { formattedNum } from '~/utils';
import { formatAmount } from '~/utils/formatAmount';
import { PRICE_IMPACT_HIGH_THRESHOLD, PRICE_IMPACT_MEDIUM_THRESHOLD } from '../Aggregator/constants';
import { TokenSelect } from './TokenSelect';
import styled from 'styled-components';

export const Container = (props: FlexProps) => (
	<Flex
		flexDir="column"
		gap="8px"
		bg="#141619"
		color="white"
		borderRadius="12px"
		p={{ base: '8px', md: '16px' }}
		border="1px solid transparent"
		_focusWithin={{ border: '1px solid white' }}
		{...props}
	/>
);

export const Label = (props: TextProps) => (
	<Text fontSize="0.875rem" fontWeight={400} color="#a2a2a2" whiteSpace="nowrap" minH="1.375rem" {...props} />
);

export const StyledInput = (props: InputProps) => (
	<Input
		focusBorderColor="transparent"
		border="none"
		bg="#141619"
		color="white"
		_focusVisible={{ outline: 'none' }}
		fontSize="2.25rem"
		p="0"
		_placeholder={{ color: '#5c5c5c' }}
		overflow="hidden"
		whiteSpace="nowrap"
		textOverflow="ellipsis"
		{...props}
	/>
);

export const AmountUsd = (props: TextProps) => (
	<Text
		fontSize="0.875rem"
		fontWeight={300}
		color="#a2a2a2"
		overflow="hidden"
		whiteSpace="nowrap"
		textOverflow="ellipsis"
		{...props}
	/>
);

export const Balance = (props: TextProps) => <Text fontSize="0.875rem" fontWeight={300} color="#a2a2a2" {...props} />;

export const MaxButton = (props: ButtonProps) => (
	<Button
		p="0"
		minH={0}
		minW={0}
		h="fit-content"
		bg="none"
		_hover={{ bg: 'none' }}
		fontSize="0.875rem"
		fontWeight={500}
		color="#2172E5"
		{...props}
	/>
);

export function InputAmountAndTokenSelect({
	amount,
	setAmount,
	type,
	tokens,
	token,
	onSelectTokenChange,
	selectedChain,
	balance,
	onMaxClick,
	tokenPrice,
	priceImpact,
	placeholder,
	customSelect,
	disabled = false
}: {
	amount: string | number;
	setAmount: Dispatch<SetStateAction<[string | number, string | number]>>;
	type: 'amountIn' | 'amountOut';
	tokens: Array<IToken>;
	token?: IToken | null;
	onSelectTokenChange: (token: any) => void;
	selectedChain?: {
		id: any;
		value: string;
		label: string;
		chainId: number;
		logoURI?: string | null;
	} | null;
	balance?: string;
	onMaxClick?: () => void;
	tokenPrice?: number | null;
	priceImpact?: number | null;
	placeholder?: string | number;
	customSelect?: React.ReactElement;
	disabled?: boolean;
}) {
	const amountUsd =
		amount && tokenPrice && !Number.isNaN(Number(formatAmount(amount))) && !Number.isNaN(Number(tokenPrice))
			? BigNumber(formatAmount(amount)).times(tokenPrice).toFixed(2)
			: null;

	return (
		<Container>
			<Label>{type === 'amountIn' ? 'You sell' : 'You buy'}</Label>

			<Flex flexDir={{ md: 'row' }} gap={{ base: '12px', md: '8px' }}>
				<Box pos="relative">
					<StyledInput
						type="text"
						value={amount}
						placeholder={(placeholder && String(placeholder)) || '0'}
						onChange={(e) => {
							const value = formatNumber(e.target.value.replace(/[^0-9.,]/g, '')?.replace(/,/g, '.'));

							if (type === 'amountOut') {
								setAmount(['', value]);
							} else {
								setAmount([value, '']);
							}
						}}
					/>
				</Box>

				{customSelect ? (
					customSelect
				) : (
					<TokenSelect tokens={tokens} token={token} onClick={onSelectTokenChange} selectedChain={selectedChain} />
				)}
			</Flex>

			<Flex alignItems="center" justifyContent="space-between" flexWrap="wrap" gap="8px" minH="1.375rem">
				<AmountUsd>
					{amountUsd && (
						<>
							<span>{`~$${formattedNum(amountUsd)}`}</span>
							<Text
								as="span"
								color={
									priceImpact
										? priceImpact >= PRICE_IMPACT_HIGH_THRESHOLD
											? 'red.500'
											: priceImpact >= PRICE_IMPACT_MEDIUM_THRESHOLD
												? 'yellow.500'
												: '#a2a2a2'
										: '#a2a2a2'
								}
							>
								{priceImpact && !Number.isNaN(priceImpact)
									? priceImpact < 0
										? ` (+${(priceImpact * -1).toFixed(2)}%)`
										: ` (-${priceImpact.toFixed(2)}%)`
									: ''}
							</Text>
						</>
					)}
				</AmountUsd>

				<Flex alignItems="center" justifyContent="flex-start" flexWrap="nowrap" gap="8px">
					{balance && (
						<>
							<Balance>{`Balance: ${Number(balance).toFixed(4)}`}</Balance>

							{onMaxClick && <MaxButton onClick={onMaxClick}>Max</MaxButton>}
						</>
					)}
				</Flex>
			</Flex>

			{type === 'amountIn' ? (
				<InputRange amount={amount} balance={balance} setAmount={setAmount} key={`range-${amount}`} />
			) : null}
		</Container>
	);
}

function formatNumber(string) {
	let pattern = /(?=(?!^)\d{3}(?:\b|(?:\d{3})+)\b)/g;
	if (string.includes('.')) {
		pattern = /(?=(?!^)\d{3}(?:\b|(?:\d{3})+)\b\.)/g;
	}
	return string.replace(pattern, ' ');
}

const InputRange = ({ amount, balance, setAmount }) => {
	const [inputRangeValue, setInputRangeValue] = useState(amount && balance ? Number((+amount / +balance) * 100) : 0);

	return (
		<InputWrapper
			style={
				{
					'--range-value': `${Math.min(inputRangeValue,100)}%`
				} as any
			}
		>
			<RangeValue>{`${(Math.min(inputRangeValue,100)).toLocaleString('en-US', { maximumFractionDigits: 2 })}%`}</RangeValue>
			<RangeInput
				type="range"
				min="0"
				max="100"
				value={Math.min(inputRangeValue,100)}
				onChange={(e) => {
					setInputRangeValue(Number(e.target.value));
				}}
				onMouseUp={(e) => {
					setAmount([+(balance ?? 0) * (Number(e.currentTarget.value) / 100), '']);
				}}
				onTouchEnd={(e) => {
					setAmount([+(balance ?? 0) * (Number(e.currentTarget.value) / 100), '']);
				}}
			/>
			<RangeButton
				onClick={() => {
					setInputRangeValue(0);
					setAmount([+(balance ?? 0) * (0 / 100), '']);
				}}
				$position={0}
			/>
			<RangeButton
				onClick={() => {
					setInputRangeValue(25);
					setAmount([+(balance ?? 0) * (25 / 100), '']);
				}}
				$position={25}
			/>
			<RangeButton
				onClick={() => {
					setInputRangeValue(50);
					setAmount([+(balance ?? 0) * (50 / 100), '']);
				}}
				$position={50}
			/>
			<RangeButton
				onClick={() => {
					setInputRangeValue(75);
					setAmount([+(balance ?? 0) * (75 / 100), '']);
				}}
				$position={75}
			/>
			<RangeButton
				onClick={() => {
					setInputRangeValue(100);
					setAmount([+(balance ?? 0) * (100 / 100), '']);
				}}
				$position={100}
			/>
		</InputWrapper>
	);
};

const InputWrapper = styled.div`
	position: relative;
	margin: 6px 0;
`;

const RangeButton = styled.button<{ $position: number }>`
	position: absolute;
	top: 8px;
	left: 0;
	width: 10px;
	height: 10px;
	border-radius: 50%;
	background-color: #2d3037;
	border: none;
	cursor: pointer;

	:nth-of-type(2) {
		left: 25%;
	}

	:nth-of-type(3) {
		left: calc(50% - 5px);
	}

	:nth-of-type(4) {
		left: calc(75% - 10px);
	}

	:nth-of-type(5) {
		left: calc(100% - 10px);
	}
`;

const RangeInput = styled.input`
	width: 100%;
	height: 4px;
	border-radius: 8px;
	-webkit-appearance: none;

	&::-webkit-slider-runnable-track {
		-webkit-appearance: none;
		height: 4px;
		border-radius: 8px;
		border: none;
		background: linear-gradient(to right, #2172E5 var(--range-value, 0%), #2d3037 var(--range-value, 0%));
	}

	&::-webkit-slider-thumb {
		-webkit-appearance: none;
		background: #2172E5;
		height: 16px;
		width: 16px;
		border-radius: 50%;
		margin-top: -6px;
		position: relative;
		z-index: 1;
		cursor: pointer;
	}
`;

const RangeValue = styled.span`
	position: absolute;
	top: -20px;
	left: var(--range-value);
	background-color: #2d3037;
	padding: 2px 4px;
	border-radius: 4px;
	color: white;
	font-size: 12px;
`;
