import { Input, VStack, Image, Flex, InputLeftElement, InputGroup, Divider, Text } from '@chakra-ui/react';
import { useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import styled from 'styled-components';
import { SearchIcon } from '@chakra-ui/icons';

const StyledRow = styled.div`
	padding: 10px 20px;
	background-color: ${({ theme }) => theme.bg1};
	transition:
		background-color 0.3s,
		transform 0.3s;
	border-radius: 15px;
	margin: 5px 0;
	color: ${({ theme }) => theme.text1};

	&:hover {
		background-color: ${({ theme }) => theme.bg2};
		transform: scale(1.02);
		cursor: pointer;
	}
`;

const StyledRows = styled.div`
	margin-top: 24px;
	height: 440px;
	overflow-y: auto;
	overflow-x: hidden;
	width: 100%;
	::-webkit-scrollbar {
		display: none;
	}
	ms-overflow-style: none;
	scrollbar-width: none;
`;

export const InfiniteList = ({ items, setToken, search, setIsSearch, isSearch }) => {
	const [searchTerm, setSearchTerm] = useState('');
	const parentRef = useRef(null);

	const filteredItems = useMemo(() => {
		if (!searchTerm) return items;
		const filtered = items
			? items.filter((item) => item.value.toLowerCase().includes(searchTerm?.trim().toLowerCase()))
			: [];
		const exactMatch = items
			? items.find((item) => item.value.toLowerCase() === searchTerm?.trim().toLowerCase())
			: null;

		const result = exactMatch ? [exactMatch, ...filtered.filter((item) => item.value !== exactMatch.value)] : filtered;
		return result;
	}, [searchTerm, items]);

	const rowVirtualizer = useVirtualizer({
		count: filteredItems.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 45,
		overscan: 5
	});
	return (
		<VStack align="stretch" w="100%" mt="1" gap="4">
			<Flex flexDirection={'column'}>
				{isSearch ? (
					<Text fontSize={'18px'} fontWeight={'bold'} mb="3">
						Select a Token
					</Text>
				) : null}
				<InputGroup>
					<InputLeftElement pointerEvents="none">
						<SearchIcon color="gray.300" />
					</InputLeftElement>
					<Input
						_focus={{
							outline: 'none',
							boxShadow: 'none'
						}}
						bgColor={'rgb(20, 22, 25)'}
						placeholder="Search by token name..."
						onChange={(e) => setSearchTerm(e.target.value)}
						onClick={() => {
							setIsSearch(true);
						}}
						value={!isSearch ? search : searchTerm}
						border="none"
					/>
				</InputGroup>
			</Flex>

			{isSearch ? (
				<Divider position={'absolute'} width={'100%'} top="108px" right={'0px'} borderColor={'gray.600'} />
			) : null}

			{isSearch ? (
				<StyledRows ref={parentRef}>
					<div
						style={{
							height: `${rowVirtualizer.getTotalSize()}px`,
							width: '100%',
							position: 'relative'
						}}
					>
						{rowVirtualizer.getVirtualItems().map((virtualRow) => {
							const item = filteredItems[virtualRow.index];
							return (
								<div
									key={String(virtualRow.key)}
									style={{
										position: 'absolute',
										top: 0,
										left: 0,
										width: '100%',
										transform: `translateY(${virtualRow.start}px)`
									}}
								>
									<StyledRow
										onClick={() => {
											setToken(item.value);
											setIsSearch(false);
											setSearchTerm('');
										}}
										style={{
											display: 'flex',
											gap: '8px',
											fontWeight: '400',
											fontSize: '16px',
											textOverflow: 'ellipsis',
											whiteSpace: 'nowrap'
										}}
									>
										<Image src={item.icon} width={'24px'} borderRadius="50%" />
										{item.label} <Text color="gray.500">{item.value}</Text>
									</StyledRow>
								</div>
							);
						})}
					</div>
				</StyledRows>
			) : null}
		</VStack>
	);
};
