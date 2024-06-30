import React from 'react';
import { Flex, Box, Button, Text } from '@chakra-ui/react';
import {
	AmountUsd,
	Container as TokenContainer,
	StyledInput as TokenInput,
	Label as TokenLabel
} from '../InputAmountAndTokenSelect';
import ReactSelect from '../MultiSelect';
import { MenuList } from '../Yields/MenuList';
import { formattedNum } from '~/utils';

const customSelectStyles = {
	control: (provided, state) => ({
		...provided,
		backgroundColor: '#222429',
		borderColor: state.isFocused ? '#4A5568' : '#222429',
		boxShadow: state.isFocused ? '0 0 0 1px #4A5568' : 'none',
		'&:hover': {
			borderColor: '#4A5568'
		}
	}),
	menu: (provided) => ({
		...provided,
		backgroundColor: '#222429',
		zIndex: 9999,
		position: 'absolute',
		width: '100%'
	}),
	menuList: (provided) => ({
		...provided,
		padding: 0
	}),
	option: (provided, state) => ({
		...provided,
		backgroundColor: state.isSelected ? '#4A5568' : state.isFocused ? '#3f444e' : '#222429',
		color: 'white',
		'&:active': {
			backgroundColor: '#4A5568'
		}
	}),
	singleValue: (provided) => ({
		...provided,
		color: 'white'
	}),
	input: (provided) => ({
		...provided,
		color: 'white'
	}),
	placeholder: (provided) => ({
		...provided,
		color: '#A0AEC0'
	}),
	dropdownIndicator: (provided) => ({
		...provided,
		color: '#A0AEC0',
		'&:hover': {
			color: 'white'
		}
	}),
	clearIndicator: (provided) => ({
		...provided,
		color: '#A0AEC0',
		'&:hover': {
			color: 'white'
		}
	})
};

export function LendingInput({
	amount,
	tokenOptions,
	selectedToken,
	onTokenChange,
	onAmountChange,
	tokenPlaceholder,
	isBorrow = false,
	isDisabled = false,
	amountUsd = 0
}) {
	return (
		<TokenContainer h="144px">
			<TokenLabel>{isBorrow ? 'You Borrow' : 'Collateral'}</TokenLabel>

			<Flex flexDir={{ md: 'row' }} gap={{ base: '12px', md: '8px' }}>
				<Box pos="relative" display={'flex'} justifyContent={'space-between'}>
					<TokenInput
						width="50%"
						value={amount}
						onChange={(e) => {
							const value = formatNumber(e.target.value.replace(/[^0-9.,]/g, '')?.replace(/,/g, '.'));
							onAmountChange(value);
						}}
					/>
					<ReactSelect
						options={tokenOptions}
						value={selectedToken ? { label: selectedToken, value: selectedToken } : null}
						onChange={onTokenChange}
						placeholder={tokenPlaceholder}
						isClearable
						isDisabled={isDisabled}
						components={{ MenuList: MenuList }}
						defaultOptions
						styles={customSelectStyles}
					/>
				</Box>
			</Flex>
			<Flex alignItems="center" justifyContent="space-between" flexWrap="wrap" gap="8px" minH="1.375rem">
				<AmountUsd>
					{amountUsd ? (
						<Text fontSize="14px" color="rgba(255, 255, 255, 0.64)">
							{formattedNum(amountUsd)}$
						</Text>
					) : null}
				</AmountUsd>
				{isBorrow ? (
					<Flex gap="8px" mt="2" justify="flex-end">
						<Button onClick={() => onAmountChange('25%')} size="xs">
							<Text fontSize={'14px'} fontWeight={'bold'}>
								25%
							</Text>
						</Button>
						<Button onClick={() => onAmountChange('50%')} size={'xs'}>
							<Text fontSize={'14px'} fontWeight={'bold'}>
								50%
							</Text>
						</Button>
						<Button onClick={() => onAmountChange('75%')} size={'xs'}>
							<Text fontSize={'14px'} fontWeight={'bold'}>
								75%
							</Text>
						</Button>
					</Flex>
				) : null}
			</Flex>
		</TokenContainer>
	);
}

function formatNumber(string) {
	let pattern = /(?=(?!^)\d{3}(?:\b|(?:\d{3})+)\b)/g;
	if (string.includes('.')) {
		pattern = /(?=(?!^)\d{3}(?:\b|(?:\d{3})+)\b\.)/g;
	}
	return string.replace(pattern, ' ');
}
