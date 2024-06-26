import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import styled from 'styled-components';
import { Box, Flex, Icon, Tooltip, Input, Text, Button } from '@chakra-ui/react';
import { ArrowRightIcon } from '@chakra-ui/icons';
import ReactSelect from '../MultiSelect';
import { ColumnHeader, RowContainer, YieldsBody, YieldsCell, YieldsContainer, YieldsWrapper } from '../Yields';
import NotFound from './NotFound';
import { formatAmountString } from '~/utils/formatAmount';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useLendingProps } from '~/queries/useLendingProps';
import { MenuList } from '../Yields/MenuList';
import Loader from '../Aggregator/Loader';
import { chainIconUrl } from '../Aggregator/nativeTokens';

const ChainIcon = styled.img`
	width: 24px;
	height: 24px;
	margin-right: 8px;
	border-radius: 50%;
`;

const YieldsRow = ({ data, index, style }) => {
	const row = data[index];
	const {
		lendUsdAmount,
		borrowUsdAmount,
		minAmountToLend,
		config: { url }
	} = row;
	const lend =
		minAmountToLend || lendUsdAmount
			? formatAmountString(lendUsdAmount ? lendUsdAmount?.toFixed(2) : minAmountToLend?.toFixed(2), '$')
			: '-';
	const borrow = formatAmountString(borrowUsdAmount ? borrowUsdAmount?.toFixed(2) : '-', '$');
	return (
		<RowContainer style={style} onClick={() => (url ? window.open(url, '_blank') : null)}>
			<YieldsCell style={{ overflow: 'hidden', display: 'block', textAlign: 'center' }}>
				{row.symbol} ➞ {row.borrowPool?.symbol}
			</YieldsCell>
			<YieldsCell>
				<ChainIcon src={`https://icons.llamao.fi/icons/protocols/${row.project}?w=48&h=48`} alt={row.project} />
			</YieldsCell>
			<YieldsCell>
				<Tooltip label={row.chain} aria-label={row.chain} placement="top">
					<ChainIcon
						src={`https://icons.llamao.fi/icons/chains/rsz_${row.chain.toLowerCase()}?w=48&h=48`}
						alt={row.chain}
					/>
				</Tooltip>
			</YieldsCell>
			<YieldsCell
				style={{
					color: row.pairNetApy > 0 ? 'rgba(0, 255, 0, 0.6)' : 'rgba(255, 0, 0, 0.6)'
				}}
			>
				{row.pairNetApy?.toFixed(2)}%
			</YieldsCell>
			<YieldsCell>{'$' + formatAmountString(row.borrowPool?.totalAvailableUsd)}</YieldsCell>
			<YieldsCell>{lend}</YieldsCell>
			<YieldsCell>{borrow}</YieldsCell>
		</RowContainer>
	);
};

const stablecoins = {
	label: 'Stables',
	value: 'STABLES',
	logoURI: 'https://icons.llamao.fi/icons/pegged/usd_native?h=48&w=48'
};

const TokenAmountSelector = ({
	tokenOptions,
	selectedToken,
	onTokenChange,
	amount,
	onAmountChange,
	tokenPlaceholder,
	amountPlaceholder,
	isBorrow = false,
	isDisabled = false
}) => {
	return (
		<Box flex="3">
			<Text fontSize={'14px'} pb="2" fontWeight={'bold'}>
				{tokenPlaceholder}
			</Text>
			<ReactSelect
				options={tokenOptions}
				value={selectedToken ? { label: selectedToken, value: selectedToken } : null}
				onChange={onTokenChange}
				placeholder={tokenPlaceholder}
				isClearable
				isDisabled={isDisabled}
				components={{ MenuList: MenuList }}
				defaultOptions
			/>
			<Text fontSize={'14px'} pb="2" pt="2" fontWeight={'bold'}>
				{amountPlaceholder}
			</Text>
			<Input
				borderRadius={'12px'}
				placeholder={selectedToken ? `${selectedToken} amount` : 'Amount'}
				value={amount}
				onChange={isDisabled ? () => {} : onAmountChange}
				bg="rgb(20, 22, 25)"
				borderColor="transparent"
				fontSize={'14px'}
				_focusVisible={{ outline: 'none' }}
			/>
			{isBorrow ? (
				<Flex gap="8px" mt="2" justify={'flex-end'}>
					<Button onClick={() => onAmountChange({ target: { value: '25%' } })} size={'xs'}>
						<Text fontSize={'14px'} fontWeight={'bold'}>
							25%
						</Text>
					</Button>
					<Button onClick={() => onAmountChange({ target: { value: '50%' } })} size={'xs'}>
						<Text fontSize={'14px'} fontWeight={'bold'}>
							50%
						</Text>
					</Button>
					<Button onClick={() => onAmountChange({ target: { value: '75%' } })} size={'xs'}>
						<Text fontSize={'14px'} fontWeight={'bold'}>
							75%
						</Text>
					</Button>
				</Flex>
			) : null}
		</Box>
	);
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

const Lending = () => {
	const {
		data: { yields: initialData, ...props },
		isLoading
	} = useLendingProps();

	const router = useRouter();
	const { lendToken, borrowToken, poolChain: selectedChain } = router.query;

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
		return initialData
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
			}));
	}, [initialData]);

	useEffect(() => {
		const filterPools = (pools, token) => {
			if (!token || token?.includes('-')) return [];
			const isStables = token === 'STABLES';
			const chainFilter = selectedChain ? (p) => p.chain === selectedChain : () => false;

			return pools.filter((p) => {
				const symbolMatch = isStables ? p?.stablecoin : p.symbol?.toLowerCase()?.includes(token?.toLowerCase());
				return symbolMatch && chainFilter(p);
			});
		};

		setLendingPools(filterPools(initialData, selectedLendToken));
		setBorrowPools(filterPools(initialData, selectedBorrowToken));
	}, [initialData, selectedBorrowToken, selectedChain, selectedLendToken]);
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

					pairs.push({
						...lendPool,
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
			<YieldsWrapper style={{ overflow: 'hidden', paddingBottom: '10px' }}>
				{isLoading ? (
					<Loader spinnerStyles={{ margin: '0 auto' }} style={{ marginTop: '128px' }} />
				) : (
					<>
						<Flex justifyContent={'center'} pt="4">
							<Text fontSize={'20px'} fontWeight={'bold'}>
								Filters
							</Text>
						</Flex>
						<Flex mb={2} pr={4} pl={4}>
							<Flex pr={4} pl={4} pt={2} w="100%" flexDirection={'column'}>
								<Text fontSize={'14px'} pb="2" fontWeight={'bold'}>
									Chain
								</Text>
								<ReactSelect
									value={
										selectedChain
											? { label: selectedChain, value: selectedChain, logoURI: chainIconUrl(selectedChain) }
											: null
									}
									onChange={(selectedChain: string) => {
										router.push(
											{
												query: { ...router.query, poolChain: selectedChain?.value }
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
						<Flex mb={2} pr={4} pl={4}>
							<Flex mb={2} pr={4} pl={4} pt={4}>
								<TokenAmountSelector
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
									onAmountChange={(e) => setAmountToLend(e.target.value)}
									tokenPlaceholder="Token to Lend"
									amountPlaceholder="Amount to Lend"
								/>
								<Box mx={4} display={'flex'} flexDirection={'column'} justifyContent={'center'}>
									<Flex alignItems="center" h="40px">
										<Icon as={ArrowRightIcon} fontSize="24px" />
									</Flex>
								</Box>
								<TokenAmountSelector
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
									onAmountChange={(e) => setAmountToBorrow(e.target.value)}
									tokenPlaceholder="Token to Borrow"
									amountPlaceholder="Amount to Borrow"
									isBorrow
								/>
							</Flex>
						</Flex>
						<Button
							onClick={resetFilters}
							colorScheme="red"
							mt="4"
							size="sm"
							variant="outline"
							style={{
								position: 'absolute',
								bottom: '20px',
								right: '20px'
							}}
						>
							Clear Filters
						</Button>
					</>
				)}
			</YieldsWrapper>
			<YieldsWrapper style={{ overflow: 'hidden', paddingBottom: '10px', width: '600px' }}>
				<Flex justifyContent={'center'} pt="4">
					<Text fontSize={'20px'} fontWeight={'bold'}>
						Pools
					</Text>
				</Flex>
				{poolPairs.length === 0 ? (
					<NotFound text={'Seclet a lending and borrowing token to see the available pairs.'} size="200px" />
				) : (
					<YieldsContainer ref={containerRef}>
						<ColumnHeader style={{ gridTemplateColumns: '1.4fr 1fr 1fr 1fr 1fr 1fr 1fr' }}>
							<YieldsCell>Symbol</YieldsCell>
							<YieldsCell>Project</YieldsCell>
							<YieldsCell>Chain</YieldsCell>

							<YieldsCell onClick={() => handleSort('pairNetApy')}>
								Net APY {sortBy === 'pairNetApy' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
							</YieldsCell>
							<YieldsCell onClick={() => handleSort('totalAvailableUsd')}>
								Available {sortBy === 'totalAvailableUsd' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
							</YieldsCell>
							<YieldsCell>Lend</YieldsCell>
							<YieldsCell>Borrow</YieldsCell>
						</ColumnHeader>
						<YieldsBody style={{ height: `380px` }}>
							{rowVirtualizer.getVirtualItems().map((virtualRow) => (
								<YieldsRow
									key={virtualRow.index}
									data={poolPairs}
									index={virtualRow.index}
									style={{
										gridTemplateColumns: '1.4fr 1fr 1fr 1fr 1fr 1fr 1fr',
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
		</div>
	);
};

export default Lending;
