import React, { useLayoutEffect, useState, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import styled from 'styled-components';
import Panel from './Panel';
import Filters from './Filters';
import { formatAmountString } from '~/utils/formatAmount';
import { useRouter } from 'next/router';
import { InfiniteList } from './List';
import Loader from '../Aggregator/Loader';
import NotFound from '../Lending/NotFound';

const ChainIcon = styled.img`
	width: 24px;
	height: 24px;
	margin-right: 8px;
	border-radius: 50%;
`;

const YieldsRow = ({ data, index, style }) => (
	<RowContainer
		style={style}
		onClick={() => window?.open(`https://defillama.com/yields/pool/${data[index].pool}`, '_blank')}
	>
		<YieldsCell>{data[index].symbol}</YieldsCell>
		<YieldsCell>
			<ChainIcon
				src={`https://icons.llamao.fi/icons/protocols/${data[index].project}?w=48&h=48`}
				alt={data[index].project}
			/>
		</YieldsCell>
		<YieldsCell>
			<ChainIcon
				src={`https://icons.llamao.fi/icons/chains/rsz_${data[index].chain.toLowerCase()}?w=48&h=48`}
				alt={data[index].chain}
			/>
		</YieldsCell>
		<YieldsCell>{data[index].apyMean30d.toFixed(2)}%</YieldsCell>
		<YieldsCell>{'$' + formatAmountString(data[index].tvlUsd)}</YieldsCell>
	</RowContainer>
);

const Yields = ({ tokens, isLoading, data: { data: initialData, config } }) => {
	const [bodyHeight, setBodyHeight] = useState(0);
	const [showFilters, setShowFilters] = useState(false);
	const [isSearch, setIsSearch] = useState(false);
	const [data, setData] = useState(initialData);
	const [sortBy, setSortBy] = useState('');
	const [sortDirection, setSortDirection] = useState('desc');
	const containerRef = useRef(null);
	const router = useRouter();
	const { search } = router.query;

	const tokensList = React.useMemo(() => {
		const allTokens = Object.values(tokens).flat();
		return allTokens.map((token: Record<string, string>) => ({
			value: token.symbol,
			label: token.name,
			icon: token.logoURI
		}));
	}, []);

	const rowVirtualizer = useVirtualizer({
		count: data.length,
		getScrollElement: () => document.scrollingElement || document.documentElement,
		estimateSize: () => 50,
		overscan: 1000
	});

	useLayoutEffect(() => {
		const containerHeight = containerRef.current.offsetHeight;
		const totalSize = rowVirtualizer.getTotalSize();
		setBodyHeight(Math.min(containerHeight, totalSize));
	}, [rowVirtualizer.getTotalSize]);

	const handleSort = (field) => {
		setSortDirection((sortDirection) => (sortDirection === 'asc' ? 'desc' : 'asc'));
		setSortBy(field);
		const direction = sortDirection === 'asc' ? 'desc' : 'asc';

		setData((data) => {
			return [...data].sort((a, b) => {
				if (a[field] < b[field]) return direction === 'asc' ? -1 : 1;
				if (a[field] > b[field]) return direction === 'asc' ? 1 : -1;
				return 0;
			});
		});
	};

	return (
		<YieldsWrapper>
			<YieldsContainer ref={containerRef}>
				{isLoading ? (
					<Loader spinnerStyles={{ margin: '0 auto' }} style={{ marginTop: '128px' }} />
				) : (
					<>
						<InfiniteList
							items={tokensList}
							search={search}
							isSearch={isSearch}
							setIsSearch={setIsSearch}
							setToken={(token) => {
								setData(initialData.filter((item) => item.symbol?.toLowerCase()?.includes(token?.toLowerCase())));

								router?.push({ query: { ...router.query, tab: 'earn', search: token } }, undefined, {
									shallow: true
								});
							}}
						/>
						<ColumnHeader>
							<YieldsCell>Symbol</YieldsCell>
							<YieldsCell>Project</YieldsCell>
							<YieldsCell>Chain</YieldsCell>
							<YieldsCell onClick={() => handleSort('apyMean30d')}>
								30d APY {sortBy === 'apyMean30d' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
							</YieldsCell>
							<YieldsCell onClick={() => handleSort('tvlUsd')}>
								TVL {sortBy === 'tvlUsd' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
							</YieldsCell>
						</ColumnHeader>
						{data?.length ? (
							<YieldsBody style={{ height: `${bodyHeight}px`, minHeight: '480px' }}>
								{rowVirtualizer.getVirtualItems().map((virtualRow) => (
									<YieldsRow
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
						) : isSearch ? null : (
							<NotFound hasSelectedFilters text={'No pools found, please change filters.'} />
						)}
					</>
				)}
			</YieldsContainer>

			<Panel isVisible={showFilters} setVisible={setShowFilters}>
				<Filters setData={setData} initialData={initialData} config={config} />
			</Panel>
		</YieldsWrapper>
	);
};

export const YieldsWrapper = styled.div`
	width: 480px;
	height: 520px;
	border: 1px solid #2f333c;
	align-self: flex-start;
	z-index: 1;
	position: relative;
	padding-bottom: 16px;
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

export const YieldsContainer = styled.div`
	width: 100%;
	height: 100%;
	overflow-y: hidden;
	-ms-overflow-style: none;
	scrollbar-width: none;
	padding: 16px;
	&::-webkit-scrollbar {
		display: none;
	}
`;

export const ColumnHeader = styled.tr`
	display: flex;
	justify-content: space-around;
	background-color: ${(props) => props.theme.bg2};
	color: ${(props) => props.theme.text1};
	font-weight: bold;
	padding: 10px 24px;
	position: sticky;
	top: 0;
	z-index: 3;
	align-items: center;
	border-radius: 16px;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	overflow: hidden;
	cursor: pointer;

	&:hover {
		background-color: ${(props) => props.theme.bg3};
	}
`;

export const YieldsCell = styled.td`
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	width: 100%;
	text-align: left;
	display: block;
`;

export const YieldsBody = styled.tbody`
	display: block;
	position: relative;
	z-index: 2;
	height: 460px;
	overflow-y: auto;
	-ms-overflow-style: none;
	scrollbar-width: none;
	margin-top: 8px;
	&::-webkit-scrollbar {
		display: none;
	}
`;

export const RowContainer = styled.tr`
	display: grid;
	grid-template-columns: repeat(5, 1fr);
	border-bottom: 1px solid ${(props) => props.theme.divider};
	padding: 10px;
	background-color: ${(props) => props.theme.bg1};
	color: ${(props) => props.theme.text1};
	border-radius: 8px;
	margin-bottom: 8px;
	align-items: center;
	&:hover {
		background-color: ${(props) => props.theme.bg2};
		cursor: pointer;
		transition: background-color 0.3s ease;
	}
`;

export const YieldsTable = styled.table`
	width: 100%;
	border-collapse: separate;
	border-spacing: 0 8px;
`;

export const YieldsHead = styled.thead`
	display: block;
`;

export default Yields;
