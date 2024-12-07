import React from 'react';
import { Flex, Input, Text, Button, Box, FlexProps, InputProps, TextProps, ButtonProps } from '@chakra-ui/react';
import BigNumber from 'bignumber.js';
import type { Dispatch, SetStateAction } from 'react';
import type { IToken } from '~/types';
import { formattedNum } from '~/utils';
import { formatAmount } from '~/utils/formatAmount';
import { PRICE_IMPACT_HIGH_THRESHOLD, PRICE_IMPACT_MEDIUM_THRESHOLD } from '../Aggregator/constants';
import { TokenSelect } from './TokenSelect';

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
		color="#1f72e5"
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
