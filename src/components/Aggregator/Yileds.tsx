import React, { memo, useLayoutEffect, useState, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import styled from 'styled-components';

const Yields = ({ data }) => {
	const [bodyHeight, setBodyHeight] = useState(0);
	const containerRef = useRef(null);
	const rowVirtualizer = useVirtualizer({
		count: data.length,
		getScrollElement: () => document.scrollingElement || document.documentElement,
		estimateSize: () => 50,
		overscan: 20
	});

	useLayoutEffect(() => {
		const containerHeight = containerRef.current.offsetHeight;
		const totalSize = rowVirtualizer.getTotalSize();
		setBodyHeight(Math.min(containerHeight, totalSize));
	}, [rowVirtualizer.getTotalSize]);

	return (
		<YieldsContainer ref={containerRef}>
			<ColumnHeader>
				<YieldsCell>Symbol</YieldsCell>
				<YieldsCell>Project</YieldsCell>
				<YieldsCell>Chain</YieldsCell>
				<YieldsCell>TVL</YieldsCell>
				<YieldsCell>30d APY</YieldsCell>
			</ColumnHeader>
			<YieldsBody style={{ height: `${bodyHeight}px` }}>
				{rowVirtualizer.getVirtualItems().map((virtualRow) => (
					<MemoizedYieldsRow
						key={virtualRow.index}
						data={data}
						index={virtualRow.index}
						style={{
							position: 'absolute',
							top: `${virtualRow.start}px`,
							height: `${virtualRow.size}px`,
							width: '100%'
						}}
					/>
				))}
			</YieldsBody>
		</YieldsContainer>
	);
};

const YieldsRow = ({ data, index, style }) => (
	<RowContainer style={style}>
		<YieldsCell>{data[index].symbol}</YieldsCell>
		<YieldsCell>{data[index].project}</YieldsCell>
		<YieldsCell>{data[index].chain}</YieldsCell>
		<YieldsCell>{data[index].tvlUsd.toLocaleString()}</YieldsCell>
		<YieldsCell>{data[index].apyMean30d.toFixed(2)}%</YieldsCell>
	</RowContainer>
);

const MemoizedYieldsRow = memo(YieldsRow);

const YieldsContainer = styled.div`
	width: 480px;
	overflow-y: auto;
	height: 520px;
	-ms-overflow-style: none;
	scrollbar-width: none;
	padding: 10px;
	&::-webkit-scrollbar {
		display: none;
	}
	border: 1px solid #2f333c;
	align-self: flex-start;
	z-index: 1;

	@media screen and (min-width: ${({ theme }) => theme.bpLg}) {
		position: sticky;
		top: 24px;
	}

	box-shadow: 10px 0px 50px 10px rgba(26, 26, 26, 0.9);

	border-radius: 16px;
	text-align: left;

	@media screen and (max-width: ${({ theme }) => theme.bpMed}) {
		box-shadow: none;
	}
`;

const ColumnHeader = styled.div`
	display: flex;
	justify-content: space-between;
	background-color: ${(props) => props.theme.bg2};
	color: ${(props) => props.theme.text1};
	font-weight: bold;
	padding: 10px;
	position: sticky;
	top: 0;
	z-index: 1;
`;

const YieldsBody = styled.div`
	position: relative;
`;

const RowContainer = styled.div`
	display: grid;
	grid-template-columns: repeat(5, 1fr);
	border-bottom: 1px solid ${(props) => props.theme.divider};
	padding: 10px;
	background-color: ${(props) => props.theme.bg1};
	color: ${(props) => props.theme.text1};
	border-radius: 8px;
	margin-bottom: 8px;

	&:hover {
		background-color: ${(props) => props.theme.bg2};
		cursor: pointer;
	}
`;

const YieldsCell = styled.div`
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

export default Yields;
