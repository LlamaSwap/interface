import { Flex, Input, Text, Button, Box } from '@chakra-ui/react';
import BigNumber from 'bignumber.js';
import type { Dispatch, SetStateAction } from 'react';
import type { IToken } from '~/types';
import { formattedNum } from '~/utils';
import { formatAmount } from '~/utils/formatAmount';
import { PRICE_IMPACT_HIGH_THRESHOLD, PRICE_IMPACT_MEDIUM_THRESHOLD } from '../Aggregator/constants';
import { TokenSelect } from './TokenSelect';

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
	placeholder
}: {
	amount: string | number;
	setAmount: Dispatch<SetStateAction<[string | number, string | number]>>;
	type: 'amountIn' | 'amountOut';
	tokens: Array<IToken>;
	token: IToken;
	onSelectTokenChange: (token: any) => void;
	selectedChain: {
		id: any;
		value: string;
		label: any;
		chainId: any;
		logoURI: string;
	};
	balance?: string;
	onMaxClick?: () => void;
	tokenPrice?: number;
	priceImpact?: number;
	placeholder?: string | number;
}) {
	const amountUsd =
		amount && tokenPrice && !Number.isNaN(Number(formatAmount(amount))) && !Number.isNaN(Number(tokenPrice))
			? BigNumber(formatAmount(amount)).times(tokenPrice).toFixed(2)
			: null;

	return (
		<Flex
			flexDir="column"
			gap="8px"
			bg="#141619"
			color="white"
			borderRadius="12px"
			p="16px"
			border="1px solid transparent"
			_focusWithin={{ border: '1px solid white' }}
		>
			<Text fontSize="0.875rem" fontWeight={400} color="#a2a2a2" whiteSpace="nowrap" minH="1.375rem">
				{type === 'amountIn' ? 'You sell' : 'You buy'}
			</Text>

			<Flex flexDir={{ base: 'column-reverse', md: 'row' }} gap={{ base: '12px', md: '8px' }}>
				<Box pos="relative">
					<Input
						type="text"
						value={amount}
						focusBorderColor="transparent"
						border="none"
						bg="#141619"
						color="white"
						_focusVisible={{ outline: 'none' }}
						fontSize="2.25rem"
						p="0"
						placeholder={(placeholder && String(placeholder)) || '0'}
						_placeholder={{ color: '#5c5c5c' }}
						onChange={(e) => {
							const value = formatNumber(e.target.value.replace(/[^0-9.,]/g, '')?.replace(/,/g, '.'));

							if (type === 'amountOut') {
								setAmount(['', value]);
							} else {
								setAmount([value, '']);
							}
						}}
						overflow="hidden"
						whiteSpace="nowrap"
						textOverflow="ellipsis"
					/>
				</Box>

				<TokenSelect tokens={tokens} token={token} onClick={onSelectTokenChange} selectedChain={selectedChain} />
			</Flex>

			<Flex alignItems="center" justifyContent="space-between" flexWrap="wrap" gap="8px" minH="1.375rem">
				<Text
					fontSize="0.875rem"
					fontWeight={300}
					color="#a2a2a2"
					overflow="hidden"
					whiteSpace="nowrap"
					textOverflow="ellipsis"
				>
					{amountUsd && (
						<>
							<span>{`~$${formattedNum(amountUsd)}`}</span>
							<Text
								as="span"
								color={
									priceImpact >= PRICE_IMPACT_HIGH_THRESHOLD
										? 'red.500'
										: priceImpact >= PRICE_IMPACT_MEDIUM_THRESHOLD
										? 'yellow.500'
										: '#a2a2a2'
								}
							>
								{priceImpact && !Number.isNaN(priceImpact) ? ` (-${priceImpact.toFixed(2)}%)` : ''}
							</Text>
						</>
					)}
				</Text>

				<Flex alignItems="center" justifyContent="flex-start" flexWrap="nowrap" gap="8px">
					{balance && (
						<>
							<Text fontSize="0.875rem" fontWeight={300} color="#a2a2a2">{`Balance: ${Number(balance).toFixed(
								4
							)}`}</Text>

							{onMaxClick && (
								<Button
									onClick={onMaxClick}
									p="0"
									minH={0}
									minW={0}
									h="fit-content"
									bg="none"
									_hover={{ bg: 'none' }}
									fontSize="0.875rem"
									fontWeight={500}
									color="#1f72e5"
								>
									Max
								</Button>
							)}
						</>
					)}
				</Flex>
			</Flex>
		</Flex>
	);
}

function formatNumber(string) {
	let pattern = /(?=(?!^)\d{3}(?:\b|(?:\d{3})+)\b)/g;
	if (string.includes('.')) {
		pattern = /(?=(?!^)\d{3}(?:\b|(?:\d{3})+)\b\.)/g;
	}
	return string.replace(pattern, ' ');
}
