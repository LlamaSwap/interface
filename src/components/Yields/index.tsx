import * as React from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import styled from 'styled-components';
import Panel from './Panel';
import Filters from './Filters';
import { formatAmountString } from '~/utils/formatAmount';
import { useRouter } from 'next/router';
import { InfiniteList } from './List';
import Loader from '../Aggregator/Loader';
import NotFound from '../Lending/NotFound';

import { Box, Divider, IconButton, Text, Tooltip } from '@chakra-ui/react';
import { Filter } from 'react-feather';
import { ArrowBackIcon, ArrowDownIcon, ArrowUpIcon } from '@chakra-ui/icons';
import { useYieldProps } from '~/queries/useYieldProps';
import { useGetTokenList } from '~/queries/useGetTokenList';
import Link from 'next/link';
import { UpDownArrow } from '../Icons';

const ChainIcon = styled.img`
	width: 24px;
	height: 24px;
	margin-right: 8px;
	border-radius: 50%;
`;

const YieldsRow = ({ data, index, style }) => (
	<Link href={`https://defillama.com/yields/pool/${data[index].pool}`} target="_blank" rel="noreferrer noopener">
		<RowContainer style={style}>
			<YieldsCell>
				<Tooltip label={data[index].symbol} placement={'top'}>
					{data[index].symbol}
				</Tooltip>
			</YieldsCell>
			<YieldsCell style={{ marginLeft: '30px' }}>
				<ChainIcon
					src={`https://icons.llamao.fi/icons/protocols/${data[index].project}?w=48&h=48`}
					alt={data[index].project}
				/>
			</YieldsCell>
			<YieldsCell style={{ marginLeft: '30px' }}>
				<ChainIcon
					src={`https://icons.llamao.fi/icons/chains/rsz_${data[index].chain.toLowerCase()}?w=48&h=48`}
					alt={data[index].chain}
				/>
			</YieldsCell>
			<YieldsCell>{data[index].apyMean30d.toFixed(2)}%</YieldsCell>
			<YieldsCell>{'$' + formatAmountString(data[index].tvlUsd)}</YieldsCell>
		</RowContainer>
	</Link>
);

const Yields = ({ tokens, isLoading, data: { data: initialData, config } }) => {
	const [bodyHeight, setBodyHeight] = React.useState(0);
	const [showFilters, setShowFilters] = React.useState(false);
	const [isSearch, setIsSearch] = React.useState(true);
	const [data, setData] = React.useState(initialData);
	const [sortBy, setSortBy] = React.useState('');
	const [sortDirection, setSortDirection] = React.useState('desc');
	const containerRef = React.useRef<HTMLDivElement>(null);
	const router = useRouter();
	const { search } = router.query;

	React.useEffect(() => {
		if (!search) {
			setIsSearch(true);
		}
	}, [search]);

	const tokensList = React.useMemo(() => {
		const allTokens = Object.values(tokens).flat() as Array<Record<string, string>>;
		const addedTokens = new Set();
		return allTokens
			.filter((token) => {
				if (addedTokens.has(token.symbol)) {
					return false;
				}
				addedTokens.add(token.symbol);
				return true;
			})
			.map((token) => ({
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

	React.useLayoutEffect(() => {
		const containerHeight = containerRef.current!.offsetHeight;
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
						{isSearch ? (
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
						) : (
							<div>
								<div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
									<ArrowBackIcon
										width={'24px'}
										height={'24px'}
										mr="4px"
										mb="1"
										cursor={'pointer'}
										onClick={() => {
											setIsSearch(true);
											router?.push({ query: { ...router.query, tab: 'earn', search: '' } }, undefined, {
												shallow: true
											});
										}}
									/>
									<Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} width={'100%'}>
										<Text display={'flex'} fontSize={'20px'} gap="4px">
											Earn with{' '}
											<Text fontWeight={'500'} color={'gray.500'}>
												{search}
											</Text>
										</Text>

										<IconButton
											aria-label="Filters"
											icon={<Filter />}
											bgColor={'inherit'}
											onClick={() => setShowFilters(true)}
										/>
									</Box>
								</div>

								<Divider width="100%" position="absolute" top="108px" left="0" borderColor={'#2C2F36'} />
								<ColumnHeader>
									<YieldsCell>Symbol</YieldsCell>
									<YieldsCell>Project</YieldsCell>
									<YieldsCell style={{ marginLeft: '16px' }}>Chain</YieldsCell>
									<YieldsCell
										style={{
											display: 'flex',
											justifyContent: 'center',
											alignItems: 'center',
											marginLeft: '20px',
											minWidth: '90px',
											color: sortBy === 'apyMean30d' ? 'white' : 'inherit',
											textOverflow: 'inherit',
											cursor: 'pointer'
										}}
										onClick={() => handleSort('apyMean30d')}
									>
										30d APY{' '}
										{sortBy === 'apyMean30d' ? (
											sortDirection === 'asc' ? (
												<ArrowUpIcon mb="1" />
											) : (
												<ArrowDownIcon mb="1" />
											)
										) : (
											<UpDownArrow />
										)}
									</YieldsCell>
									<YieldsCell
										onClick={() => handleSort('tvlUsd')}
										style={{
											display: 'flex',
											justifyContent: 'center',
											alignItems: 'center',
											color: sortBy === 'tvlUsd' ? 'white' : 'inherit',
											cursor: 'pointer'
										}}
									>
										TVL{' '}
										{sortBy === 'tvlUsd' ? (
											sortDirection === 'asc' ? (
												<ArrowUpIcon mb="1" />
											) : (
												<ArrowDownIcon mb="1" />
											)
										) : (
											<UpDownArrow />
										)}
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
							</div>
						)}
					</>
				)}
			</YieldsContainer>

			<Panel isVisible={showFilters} setVisible={setShowFilters}>
				<Filters
					setData={setData}
					initialData={initialData}
					config={config}
					closeFilters={() => setShowFilters(false)}
				/>
			</Panel>
		</YieldsWrapper>
	);
};

export const YieldsWrapper = styled.div`
	width: 100%;
	max-width: 550px;
	height: auto;
	min-height: 560px;
	border: 1px solid #2f333c;
	align-self: center;
	z-index: 1;
	position: relative;
	padding: 16px;
	margin: 0 auto;
	box-shadow: 0px 0px 20px rgba(26, 26, 26, 0.5);
	border-radius: 16px;
	text-align: left;

	@media screen and (min-width: ${({ theme }) => theme.bpLg}) {
		position: sticky;
		top: 24px;
		align-self: flex-start;
	}

	@media screen and (max-width: ${({ theme }) => theme.bpMed}) {
		box-shadow: none;
		max-width: 100%;
	}
`;

export const YieldsContainer = styled.div`
	width: 100%;
	height: 100%;
	overflow-y: auto;
`;

export const YieldsTable = styled.table`
	width: 100%;
	border-collapse: separate;
	border-spacing: 0 8px;
`;

export const YieldsHead = styled.thead`
	position: sticky;
	top: 0;
	background-color: ${(props) => props.theme.bg1};
	z-index: 3;
`;

export const ColumnHeader = styled.tr`
	display: grid;
	grid-template-columns: 1.5fr 1fr 1fr 1fr 1.5fr;
	color: ${(props) => props.theme.text3};
	font-weight: bold;
	padding: 10px 0;
	border-bottom: 1px solid ${(props) => props.theme.bg2};
	font-size: 14px;
	text-align: center;
	@media screen and (min-width: ${({ theme }) => theme.bpMed}) {
		font-size: 16px;
	}
`;

export const HeaderCell = styled.th`
	text-align: center;
	padding: 0 5px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
`;

export const YieldsBody = styled.tbody`
	display: block;
	position: relative;
	z-index: 2;
	max-height: 460px;
	overflow-y: auto;
`;

export const RowContainer = styled.tr`
	display: grid;
	grid-template-columns: 1.5fr 1fr 1fr 1fr 1.5fr;
	border-bottom: 1px solid ${(props) => props.theme.bg2};
	padding: 10px 0;
	font-size: 14px;
	font-weight: 400;
	background-color: ${(props) => props.theme.bg1};
	color: ${(props) => props.theme.text1};
	margin-bottom: 8px;
	align-items: center;

	&:hover {
		background-color: ${(props) => props.theme.bg2};
		cursor: pointer;
		transition: background-color 0.3s ease;
	}

	@media screen and (min-width: ${({ theme }) => theme.bpMed}) {
		font-size: 16px;
	}
`;

export const YieldsCell = styled.td`
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	text-align: center;
	padding: 0 5px;
	min-width: 50px;

	@media screen and (min-width: ${({ theme }) => theme.bpMed}) {
		min-width: 76px;
	}
`;

const Wrapper = () => {
	const { data, isLoading } = useGetTokenList();
	const yieldProps = useYieldProps();

	if (isLoading || yieldProps.isLoading) {
		return (
			<YieldsWrapper>
				<Loader spinnerStyles={{ margin: '0 auto' }} style={{ marginTop: '128px' }} />
			</YieldsWrapper>
		);
	}

	return <Yields tokens={data ?? {}} {...yieldProps} />;
};

export default Wrapper;
