import { Box, Input, VStack, Image } from '@chakra-ui/react';
import { useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import styled from 'styled-components';

const StyledRow = styled.div`
	padding: 10px 20px;
	border-bottom: 1px solid ${({ theme }) => theme.divider};
	background-color: ${({ theme }) => theme.bg1};
	transition: background-color 0.3s, transform 0.3s;
	border-radius: 15px;
	margin: 5px 0;
	color: ${({ theme }) => theme.text1};

	&:hover {
		background-color: ${({ theme }) => theme.bg2};
		transform: scale(1.02);
		cursor: pointer;
	}
`;

export const InfiniteList = ({ items, setToken }) => {
	const [searchTerm, setSearchTerm] = useState('');
	const parentRef = useRef(null);

	const filteredItems = useMemo(() => {
		return items ? items.filter((item) => item.label.toLowerCase().includes(searchTerm.toLowerCase())) : [];
	}, [searchTerm, items]);

	const rowVirtualizer = useVirtualizer({
		count: filteredItems.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 45,
		overscan: 5
	});

	return (
		<VStack align="stretch" w="100%" mt="4" paddingRight="20px">
			<Input placeholder="Search by token name..." onChange={(e) => setSearchTerm(e.target.value)} />
			<Box ref={parentRef} height="400px" overflowY="auto" overflowX="hidden" width="100%">
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
								key={virtualRow.key}
								style={{
									position: 'absolute',
									top: 0,
									left: 0,
									width: '100%',
									transform: `translateY(${virtualRow.start}px)`
								}}
							>
								<StyledRow onClick={() => setToken(item.value)} style={{ display: 'flex', gap: '8px' }}>
									<Image src={item.icon} width={'24px'} borderRadius="50%" />
									{item.label} ({item.value})
								</StyledRow>
							</div>
						);
					})}
				</div>
			</Box>
		</VStack>
	);
};
