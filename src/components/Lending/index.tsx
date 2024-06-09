import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import styled from 'styled-components';
import { Box, Flex, Icon, Tooltip } from '@chakra-ui/react';
import { ArrowRightIcon } from '@chakra-ui/icons';
import ReactSelect from '../MultiSelect';
import { ColumnHeader, RowContainer, YieldsBody, YieldsCell, YieldsContainer, YieldsWrapper } from '../Yields';
import NotFound from './NotFound';
import { formatAmountString } from '~/utils/formatAmount';

const ChainIcon = styled.img`
	width: 24px;
	height: 24px;
	margin-right: 8px;
	border-radius: 50%;
`;

const YieldsRow = ({ data, index, style }) => (
	<RowContainer style={style}>
		<YieldsCell style={{ overflow: 'hidden', display: 'block', textAlign: 'center' }}>
			{data[index].symbol} ➞ {data[index].borrowPool?.symbol}
		</YieldsCell>
		<YieldsCell>
			<ChainIcon
				src={`https://icons.llamao.fi/icons/protocols/${data[index].project}?w=48&h=48`}
				alt={data[index].project}
			/>
		</YieldsCell>

		<YieldsCell>
			<Tooltip label={data[index].chain} aria-label={data[index].chain} placement="top">
				<ChainIcon
					src={`https://icons.llamao.fi/icons/chains/rsz_${data[index].chain.toLowerCase()}?w=48&h=48`}
					alt={data[index].chain}
				/>
			</Tooltip>
		</YieldsCell>
		<YieldsCell
			style={{
				color: data[index].pairNetApy > 0 ? 'rgba(0, 255, 0, 0.6)' : 'rgba(255, 0, 0, 0.6)'
			}}
		>
			{data[index].pairNetApy?.toFixed(2)}%
		</YieldsCell>
		<YieldsCell>{'$' + formatAmountString(data[index].borrowPool?.totalAvailableUsd)}</YieldsCell>
	</RowContainer>
);

const stablecoins = {
	label: 'Stablecoins',
	value: 'STABLES',
	logoURI: 'https://icons.llamao.fi/icons/pegged/usd_native?h=48&w=48'
};

const Lending = (props) => {
	const { yields: initialData } = props;

	const [lendingPools, setLendingPools] = useState([]);
	const [borrowPools, setBorrowPools] = useState([]);
	const [sortBy, setSortBy] = useState('');
	const [sortDirection, setSortDirection] = useState('desc');
	const containerRef = useRef(null);
	const [selectedLendToken, setSelectedLendToken] = useState(null);
	const [selectedBorrowToken, setSelectedBorrowToken] = useState(null);
	const [poolPairs, setPoolPairs] = useState([]);

	const rowVirtualizer = useVirtualizer({
		count: poolPairs.length,
		getScrollElement: () => document.scrollingElement || document.documentElement,
		estimateSize: () => 50,
		overscan: 1000
	});

	const handleLendTokenChange = (selected) => {
		setSelectedLendToken(selected);
	};

	const handleBorrowTokenChange = (selected) => {
		setSelectedBorrowToken(selected);
	};
	const tokensList = useMemo(() => {
		return [
			stablecoins,
			...props.symbols.map((symbol) => ({
				label: symbol,
				value: symbol,
				logoURI: props.tokensData[symbol].image
			}))
		];
	}, [props.symbols]);

	useEffect(() => {
		setLendingPools(
			initialData.filter((p) => {
				if (p?.stablecoin && selectedLendToken?.value === 'STABLES') return true;
				return selectedLendToken ? p.symbol?.toLowerCase()?.includes(selectedLendToken?.value?.toLowerCase()) : false;
			})
		);
		setBorrowPools(
			initialData.filter((p) => {
				if (p?.stablecoin && selectedBorrowToken?.value === 'STABLES') return true;
				return selectedBorrowToken
					? p.symbol?.toLowerCase()?.includes(selectedBorrowToken?.value?.toLowerCase())
					: false;
			})
		);
	}, [selectedLendToken, selectedBorrowToken]);

	useEffect(() => {
		if (!selectedLendToken || !selectedBorrowToken) {
			return setPoolPairs([]);
		}

		const pairs = lendingPools
			.map((lendPool) => {
				const filteredBorrowPools = borrowPools?.filter(
					(p) => p.project === lendPool.project && p.chain === lendPool.chain && lendPool.pool !== p.pool
				);

				if (!filteredBorrowPools?.length) {
					return null;
				}
				const poolPairs = filteredBorrowPools.map((borrowPool) => {
					const pairNetApy = lendPool.apy + borrowPool.apyBorrow * lendPool.ltv;
					const pairRewardApy = lendPool.apyReward + borrowPool.apyRewardBorrow * lendPool.ltv;
					return { ...lendPool, pairNetApy, pairRewardApy, borrowPool };
				});

				return poolPairs;
			})
			.filter(Boolean)
			.flat();

		setPoolPairs(pairs);
	}, [lendingPools, borrowPools]);

	const handleSort = (field) => {
		setSortDirection((sortDirection) => (sortDirection === 'asc' ? 'desc' : 'asc'));
		setSortBy(field);
		const direction = sortDirection === 'asc' ? 'desc' : 'asc';
		setPoolPairs((data) => {
			return [...data].sort((a, b) => {
				if (a[field] < b[field]) return direction === 'asc' ? -1 : 1;
				if (a[field] > b[field]) return direction === 'asc' ? 1 : -1;
				return 0;
			});
		});
	};

	return (
		<YieldsWrapper style={{ overflow: 'hidden', paddingBottom: '10px' }}>
			<Flex mb={2} pr={4} pl={4} pt={4}>
				<Box flex="3">
					<ReactSelect
						options={tokensList}
						value={selectedLendToken}
						onChange={handleLendTokenChange}
						placeholder="Token to Lend"
						isClearable
					/>
				</Box>
				<Box mx={4}>
					<Flex alignItems="center" h="40px">
						<Icon as={ArrowRightIcon} fontSize="24px" />
					</Flex>
				</Box>
				<Box flex="3">
					<ReactSelect
						options={tokensList}
						value={selectedBorrowToken}
						onChange={handleBorrowTokenChange}
						placeholder="Token to Borrow"
						isClearable
					/>
				</Box>
			</Flex>
			{poolPairs.length === 0 ? (
				<NotFound
					hasSelectedFilters={selectedBorrowToken && selectedLendToken}
					defaultText="Seclet a lending and borrowing token to see the available pairs."
				/>
			) : (
				<YieldsContainer ref={containerRef}>
					<ColumnHeader style={{ gridTemplateColumns: '1.6fr 1fr 1fr 1fr 1fr' }}>
						<YieldsCell>Symbol</YieldsCell>
						<YieldsCell>Project</YieldsCell>
						<YieldsCell>Chain</YieldsCell>
						<YieldsCell onClick={() => handleSort('pairNetApy')}>
							Net APY {sortBy === 'pairNetApy' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
						</YieldsCell>
						<YieldsCell onClick={() => handleSort('tvlUsd')}>
							Available {sortBy === 'tvlUsd' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
						</YieldsCell>
					</ColumnHeader>
					<YieldsBody style={{ height: `380px`, minHeight: '480px' }}>
						{rowVirtualizer.getVirtualItems().map((virtualRow) => (
							<YieldsRow
								key={virtualRow.index}
								data={poolPairs}
								index={virtualRow.index}
								style={{
									gridTemplateColumns: '1.6fr 1fr 1fr 1fr 1fr',
									position: 'absolute',
									top: `${virtualRow.start}px`,
									height: `${virtualRow.size}px`,
									width: '100%'
								}}
							/>
						))}
					</YieldsBody>
				</YieldsContainer>
			)}
		</YieldsWrapper>
	);
};

export default Lending;
