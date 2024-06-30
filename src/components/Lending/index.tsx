import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import styled from 'styled-components';
import { Box, Flex, Icon, Tooltip, Input, Text, Button } from '@chakra-ui/react';
import ReactSelect from '../MultiSelect';
import { ColumnHeader, RowContainer, YieldsBody, YieldsCell, YieldsContainer, YieldsWrapper } from '../Yields';
import NotFound from './NotFound';
import { formatAmountString } from '~/utils/formatAmount';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { MenuList } from '../Yields/MenuList';
import Loader from '../Aggregator/Loader';
import { chainIconUrl } from '../Aggregator/nativeTokens';
import { LendingInput } from './TokenInput';
import { SwapInputArrow } from '../Aggregator';
import { last } from 'lodash';

const ChainIcon = styled.img`
	width: 24px;
	height: 24px;
	margin-right: 8px;
	border-radius: 50%;
`;

const YieldsRow = ({ data, index, style }) => {
	const row = data[index];
	const {
		config: { url, name }
	} = row;

	return (
		<RowContainer style={style} onClick={() => (url ? window.open(url, '_blank') : null)}>
			<YieldsCell style={{ marginLeft: '24px' }}>
				<Tooltip label={row.chain} aria-label={row.chain} placement="top">
					<ChainIcon
						src={`https://icons.llamao.fi/icons/chains/rsz_${row.chain.toLowerCase()}?w=48&h=48`}
						alt={row.chain}
					/>
				</Tooltip>
			</YieldsCell>
			<YieldsCell style={{ overflow: 'hidden', display: 'block', textAlign: 'center' }}>
				{row.symbol} ➞ {row.borrowPool?.symbol}
			</YieldsCell>
			<YieldsCell>
				<ChainIcon
					src={`https://icons.llamao.fi/icons/protocols/${row.project}?w=48&h=48`}
					style={{ position: 'absolute' }}
					alt={row.project}
				/>
				<span style={{ marginLeft: '28px' }}>{name}</span>
			</YieldsCell>
			<YieldsCell
				style={{
					color: row.totalApy > 0 ? 'rgba(0, 255, 0, 0.6)' : 'rgba(255, 0, 0, 0.6)'
				}}
			>
				{row.totalApy?.toFixed(2)}%
			</YieldsCell>
			<YieldsCell>{'$' + formatAmountString(row.borrowPool?.totalAvailableUsd)}</YieldsCell>
			<YieldsCell>{formatAmountString(row?.ltv * 100)}%</YieldsCell>
		</RowContainer>
	);
};

const stablecoins = {
	label: 'Stables',
	value: 'STABLES',
	logoURI: 'https://icons.llamao.fi/icons/pegged/usd_native?h=48&w=48'
};

const useGetPrices = (tokens) => {
	const res = useQuery(
		['getPrices', tokens],
		async () => {
			const prices = await fetch(`https://coins.llama.fi/prices/current/${tokens.join(',')}`).then((res) => res.json());
			return prices;
		},
		{
			enabled: tokens?.length > 0
		}
	);
	return { ...res, data: res?.data?.coins };
};

const chainNameMap = {
	avalanche: 'avax'
};

const mapChainName = (chain) => {
	return chainNameMap[chain?.toLowerCase()] || chain;
};

export const arrayFromString = (el): Array<any> => (el === undefined ? [] : Array.isArray(el) ? el : [el]);

const safeProjects = [
	'AAVE',
	'AAVE V2',
	'AAVE V3',
	'AAVE V1',
	'MakerDAO',
	'Spark',
	'Compound',
	'Compound V1',
	'Compound V2',
	'Compound V3'
];

const Lending = ({ data: { yields: initialData, ...props }, isLoading }) => {
	const [activeTab, setActiveTab] = useState(0);
	const tabs = [{ label: 'Safe' }, { label: 'Degen' }];
	const router = useRouter();
	let { lendToken, borrowToken, poolChain: selectedChain = 'All Chains' } = router.query;
	selectedChain = useMemo(() => arrayFromString(selectedChain), [selectedChain]);
	const [lendingPools, setLendingPools] = useState([]);
	const [borrowPools, setBorrowPools] = useState([]);
	const [sortBy, setSortBy] = useState('');
	const [sortDirection, setSortDirection] = useState('desc');
	const containerRef = useRef(null);
	const selectedLendToken = lendToken;
	const selectedBorrowToken = borrowToken;
	const [amountToLend, setAmountToLend] = useState('');
	const [amountToBorrow, setAmountToBorrow] = useState('');
	const [poolPairs, setPoolPairs] = useState([]);

	const tokens = useMemo(() => {
		return [
			...new Set(
				poolPairs
					.map((p) =>
						[p, p.borrowPool].map(
							(p) => `${mapChainName(p?.chain?.toLowerCase())}:${p?.underlyingTokens?.[0]?.toLowerCase()}`
						)
					)
					.flat()
			)
		];
	}, [poolPairs]);

	const { data: prices } = useGetPrices(tokens);

	const rowVirtualizer = useVirtualizer({
		count: poolPairs.length,
		getScrollElement: () => document.scrollingElement || document.documentElement,
		estimateSize: () => 50,
		overscan: 1000
	});

	const tokensList = useMemo(() => {
		return [
			stablecoins,
			...props.tokens.map((token) => ({
				label: token.name,
				value: token.symbol
			}))
		];
	}, [props.tokens]);

	const chainList = useMemo(() => {
		return [{ label: 'All Chains', value: 'All Chains', logoURI: false }].concat(
			initialData
				.reduce((acc, pool) => {
					if (!acc.includes(pool.chain)) {
						acc.push(pool.chain);
					}
					return acc;
				}, [])
				.map((chain) => ({
					label: chain,
					value: chain,
					logoURI: chainIconUrl(chain)
				}))
		);
	}, [initialData]);

	useEffect(() => {
		const filterPools = (pools, token) => {
			if (!token || token?.includes('-')) return [];
			const isStables = token === 'STABLES';
			const chainFilter = selectedChain
				? selectedChain?.includes('All Chains')
					? () => true
					: (p) => selectedChain?.includes(p.chain)
				: () => false;

			return pools.filter((p) => {
				const symbolMatch = isStables ? p?.stablecoin : p.symbol?.toLowerCase()?.includes(token?.toLowerCase());
				const safePoolMacth = activeTab === 0 ? safeProjects.includes(p.config.name) : true;
				return symbolMatch && chainFilter(p) && safePoolMacth;
			});
		};

		setLendingPools(filterPools(initialData, selectedLendToken));
		setBorrowPools(filterPools(initialData, selectedBorrowToken));
	}, [initialData, selectedBorrowToken, selectedChain, selectedLendToken, activeTab]);
	useEffect(() => {
		if (!selectedLendToken || !selectedBorrowToken) {
			return setPoolPairs([]);
		}

		const pairs = [];

		const borrowPoolMap = new Map();
		borrowPools.forEach((pool) => {
			const key = `${pool.project}:${pool.chain}`;
			if (!borrowPoolMap.has(key)) {
				borrowPoolMap.set(key, []);
			}
			borrowPoolMap.get(key).push(pool);
		});

		lendingPools.forEach((lendPool) => {
			const key = `${lendPool.project}:${lendPool.chain}`;
			const matchingBorrowPools = borrowPoolMap.get(key) || [];
			matchingBorrowPools.forEach((borrowPool) => {
				if (lendPool.pool !== borrowPool.pool && borrowPool?.borrowable) {
					const lendTokenPrice =
						selectedLendToken === 'STABLES'
							? 1
							: prices?.[
									`${mapChainName(lendPool?.chain?.toLowerCase())}:${lendPool?.underlyingTokens?.[0]?.toLowerCase()}`
							  ]?.price;
					const borrowTokenPrice =
						selectedBorrowToken === 'STABLES'
							? 1
							: prices?.[
									`${mapChainName(
										borrowPool?.chain?.toLowerCase()
									)}:${borrowPool?.underlyingTokens?.[0]?.toLowerCase()}`
							  ]?.price;
					const lendUsdAmount = amountToLend ? lendTokenPrice * parseFloat(amountToLend) : null;
					const maxAmountToBorrow = lendUsdAmount * lendPool.ltv;
					let borrowUsdAmount = amountToBorrow
						? amountToBorrow?.includes('%')
							? (maxAmountToBorrow * Number(amountToBorrow.replace('%', ''))) / 100
							: borrowTokenPrice * +amountToBorrow
						: null;

					borrowUsdAmount = borrowUsdAmount && maxAmountToBorrow <= borrowUsdAmount ? 0 : borrowUsdAmount;
					const minAmountToLend = borrowUsdAmount / lendPool.ltv;
					const lendBorrowRatio = borrowUsdAmount / lendUsdAmount || 0;
					const pairNetApy = lendPool.apy + borrowPool.apyBorrow * lendPool.ltv * lendBorrowRatio;
					const pairRewardApy = lendPool.apyReward + borrowPool.apyRewardBorrow * lendPool.ltv * lendBorrowRatio;
					const totalApy = pairNetApy + pairRewardApy;
					pairs.push({
						...lendPool,
						totalApy,
						pairNetApy,
						pairRewardApy,
						borrowPool,
						lendUsdAmount,
						borrowUsdAmount,
						lendTokenPrice,
						borrowTokenPrice,
						maxAmountToBorrow,
						minAmountToLend
					});
				}
			});
		});

		setPoolPairs(
			pairs.sort((a, b) => {
				const fieldA = sortBy === 'totalAvailableUsd' ? a.borrowPool[sortBy] : a[sortBy];
				const fieldB = sortBy === 'totalAvailableUsd' ? b.borrowPool[sortBy] : b[sortBy];
				if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
				if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
				return 0;
			})
		);
	}, [
		lendingPools,
		borrowPools,
		prices,
		selectedLendToken,
		selectedBorrowToken,
		amountToLend,
		amountToBorrow,
		sortBy,
		sortDirection
	]);

	const handleSort = (field) => {
		setSortDirection((sortDirection) => (sortDirection === 'asc' ? 'desc' : 'asc'));
		setSortBy(field);
	};

	const resetFilters = () => {
		router.push(
			{
				query: { tab: 'borrow' }
			},
			undefined,
			{ shallow: true }
		);
		setAmountToLend('');
		setAmountToBorrow('');
	};

	return (
		<div style={{ display: 'flex', gap: '16px' }}>
			<YieldsWrapper style={{ paddingBottom: '10px' }}>
				{isLoading ? (
					<Loader spinnerStyles={{ margin: '0 auto' }} style={{ marginTop: '128px' }} />
				) : (
					<>
						<Flex justifyContent="center" pt="4">
							<Text fontSize="20px" fontWeight="bold">
								Filters
							</Text>
						</Flex>
						<Flex pr={4} pl={4}>
							<Flex pr={4} pl={4} pt={2} w="100%" flexDirection={'column'}>
								<Text fontSize={'16px'} pb="2" fontWeight={'bold'}>
									Chain
								</Text>
								<ReactSelect
									isMulti
									value={
										selectedChain
											? selectedChain.map((chain) => ({
													label: chain,
													value: chain,
													logoURI: chain.includes('All Chains') ? false : chainIconUrl(chain)
											  }))
											: null
									}
									onChange={(selectedChain: Array<Record<string, string>>) => {
										let chains = selectedChain.map((c) => c?.value);
										if (chains?.length === 2 && chains.includes('All Chains'))
											chains = chains.filter((c) => c !== 'All Chains');
										else if (last(chains) === 'All Chains') chains = ['All Chains'];
										router.push(
											{
												query: { ...router.query, poolChain: chains }
											},
											undefined,
											{ shallow: true }
										);
									}}
									options={chainList}
									placeholder="Select chain..."
									isClearable
									style={{ width: '100%' }}
								/>
							</Flex>
						</Flex>
						<Flex pr={4} pl={4}>
							<Flex mb={2} pr={4} pl={4} pt={4} flexDirection={'column'} gap="4px">
								<LendingInput
									tokenOptions={tokensList}
									selectedToken={selectedLendToken}
									onTokenChange={(token) => {
										router.push(
											{
												query: { ...router.query, lendToken: token?.value }
											},
											undefined,
											{ shallow: true }
										);
									}}
									amount={amountToLend || ''}
									onAmountChange={setAmountToLend}
									tokenPlaceholder="Token to Lend"
								/>
								<SwapInputArrow top="13%" mt="0" l="50%" />
								<LendingInput
									tokenOptions={tokensList}
									selectedToken={selectedBorrowToken}
									onTokenChange={(token) => {
										router.push(
											{
												query: { ...router.query, borrowToken: token?.value }
											},
											undefined,
											{ shallow: true }
										);
									}}
									amount={amountToBorrow || ''}
									onAmountChange={setAmountToBorrow}
									tokenPlaceholder="Token to Borrow"
									isBorrow
								/>
							</Flex>
						</Flex>
						<Button
							onClick={resetFilters}
							colorScheme="gray"
							size="sm"
							variant="outline"
							style={{
								position: 'absolute',
								bottom: '32px',
								right: '20px'
							}}
							mr="16px"
						>
							Clear Filters
						</Button>
					</>
				)}
			</YieldsWrapper>
			<YieldsWrapper style={{ overflow: 'hidden', paddingBottom: '10px', width: '600px' }}>
				<Box>
					<Flex mb={4}>
						<TabsContainer>
							<TabButtonsContainer>
								{tabs.map((tab, index) =>
									index === activeTab ? (
										<ActiveTabButton key={index} onClick={() => setActiveTab(index)}>
											{tab.label}
										</ActiveTabButton>
									) : (
										<TabButton key={index} onClick={() => setActiveTab(index)}>
											{tab.label}
										</TabButton>
									)
								)}
								<ActiveTabIndicator
									style={{
										left: `${(activeTab * 100) / tabs.length}%`,
										width: `${100 / tabs.length}%`,
										top: 0
									}}
								/>
							</TabButtonsContainer>
							<TabContent>
								{poolPairs.length === 0 ? (
									<NotFound text={'Seclet a lending and borrowing token to see the available pairs.'} size="200px" />
								) : (
									<YieldsContainer ref={containerRef} style={{ paddingTop: 0 }}>
										<ColumnHeader>
											<th>Chain</th>
											<th>Symbol</th>
											<th>Project</th>

											<th onClick={() => handleSort('pairNetApy')}>
												Net APY {sortBy === 'pairNetApy' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
											</th>
											<th onClick={() => handleSort('totalAvailableUsd')}>
												Available {sortBy === 'totalAvailableUsd' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
											</th>
											<th>LTV</th>
										</ColumnHeader>
										<YieldsBody style={{ height: `380px` }}>
											{rowVirtualizer.getVirtualItems().map((virtualRow) => (
												<YieldsRow
													key={virtualRow.index}
													data={poolPairs}
													index={virtualRow.index}
													style={{
														gridTemplateColumns: '1fr 2fr 1.5fr 1fr 1fr 1fr',
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
							</TabContent>
						</TabsContainer>
					</Flex>
				</Box>
			</YieldsWrapper>
		</div>
	);
};

export default Lending;

const TabsContainer = styled(Box)`
	width: 100%;
	background: ${(props) => props.theme.bg2};
	border-radius: 8px;
	overflow: hidden;
`;

const TabButtonsContainer = styled.div`
	display: flex;
	width: 100%;
	position: relative;
	z-index: 1;
`;

const TabButton = styled.button`
	flex: 1;
	font-size: 16px;
	font-weight: bold;
	background: ${(props) => props.theme.bg2};
	color: ${(props) => props.theme.text2};
	padding: 12px 20px;
	border: none;
	cursor: pointer;
	transition: all 0.3s ease;

	&:focus {
		outline: none;
	}

	&:hover {
		background: ${(props) => props.theme.bg3};
	}
`;

const ActiveTabButton = styled(TabButton)`
	background: ${(props) => props.theme.bg1};
	color: ${(props) => props.theme.text1};

	&:hover {
		background: ${(props) => props.theme.bg1};
	}
`;

const TabContent = styled(Box)`
	background: ${(props) => props.theme.bg1};
	color: ${(props) => props.theme.text1};
	padding: 20px;
	padding-top: 8px;
	width: 100%;
	border-bottom-left-radius: 8px;
	border-bottom-right-radius: 8px;
`;

const ActiveTabIndicator = styled.div`
	position: absolute;
	bottom: 0;
	height: 3px;
	background: ${(props) => props.theme.primary1};
	transition: all 0.3s ease;
`;
