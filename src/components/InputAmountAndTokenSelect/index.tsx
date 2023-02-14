import { Flex, Input, Text, Button } from '@chakra-ui/react';
import type { Dispatch, SetStateAction } from 'react';
import type { IToken } from '~/types';
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
	onMaxClick
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
}) {
	return (
		<Flex
			flexDir={{ base: 'column-reverse', md: 'row' }}
			gap={{ base: '12px', md: '8px' }}
			bg="#141619"
			color="white"
			borderRadius="12px"
			p="20px"
			pb="36px"
			border="1px solid transparent"
			_focusWithin={{ border: '1px solid white' }}
			pos="relative"
		>
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
				placeholder="0"
				_placeholder={{ color: '#5c5c5c' }}
				onChange={(e) => {
					const value = e.target.value.replace(/[^0-9.,]/g, '').replace(/,/g, '.');
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

			<TokenSelect tokens={tokens} token={token} onClick={onSelectTokenChange} selectedChain={selectedChain} />

			{balance && (
				<Flex pos="absolute" right="20px" bottom="8px" alignItems="center" gap="8px">
					<Text fontSize="0.875rem" fontWeight={300} color="#a2a2a2">{`Balance: ${Number(balance).toFixed(4)}`}</Text>

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
				</Flex>
			)}
		</Flex>
	);
}
