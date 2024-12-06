import { debounce } from 'lodash';
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
	Box,
	Flex,
	Text,
	Input,
	RangeSlider,
	RangeSliderTrack,
	RangeSliderFilledTrack,
	RangeSliderThumb,
	Button,
	useColorModeValue,
	Switch
} from '@chakra-ui/react';
import MultiSelect from '../MultiSelect';
import { chainIconUrl } from '../Aggregator/nativeTokens';
import { useRouter } from 'next/router';
import { createFilter } from 'react-select';
import { MenuList } from './MenuList';
import { arrayFromString } from '../Lending';
import { CloseIcon, DeleteIcon } from '@chakra-ui/icons';
import styled from 'styled-components';

const createIndex = (data, key) => {
	return data.reduce((acc, item) => {
		const value = item[key];
		if (!acc[value]) acc[value] = [];
		acc[value].push(item);
		return acc;
	}, {});
};

const useAdvancedFilter = (initialData, config = {}) => {
	const indexes = useMemo(
		() => ({
			chain: createIndex(initialData, 'chain'),
			project: createIndex(initialData, 'project')
		}),
		[initialData]
	);

	return useCallback(
		(query) => {
			const {
				chains,
				projects,
				search = '',
				apyFrom = 0,
				apyTo = 200,
				tvlFrom = '',
				tvlTo = '',
				category,
				includeRewardApy
			} = query;
			let filteredData = initialData;

			if (search.length === 0) {
				return [];
			}
			if (chains && chains.length) {
				const chainArray = chains;
				filteredData = chainArray.flatMap((chain) => indexes.chain[chain] || []);
			}

			if (projects && projects.length) {
				const projectArray = projects;
				filteredData = filteredData.filter((item) => projectArray.includes(item.project));
			}

			if (category && category.length) {
				filteredData = filteredData.filter((item) => category.includes(config[item.project]?.category));
			}

			if (search) {
				const searchLower = search.toLowerCase();
				filteredData = filteredData.filter((item) => item.symbol.toLowerCase().includes(searchLower));
			}

			if (includeRewardApy === 'false') {
				filteredData = filteredData.map((item) => {
					return {
						...item,
						apy: item.apy - (item.apyReward || 0)
					};
				});
			}

			filteredData = filteredData.filter((item) => item.apyMean30d >= +apyFrom && item.apyMean30d <= +apyTo);

			if (tvlFrom || tvlTo) {
				filteredData = filteredData.filter(
					(item) => (!tvlFrom || item.tvlUsd >= +tvlFrom) && (!tvlTo || item.tvlUsd <= +tvlTo)
				);
			}

			return filteredData;
		},
		[initialData, indexes.chain, config]
	);
};

const Filters = ({ setData, initialData, config, closeFilters }) => {
	const router = useRouter();

	let {
		chains,
		projects,
		search = '',
		apyFrom = 0,
		apyTo = 200,
		tvlFrom = '',
		tvlTo = '',
		category,
		includeRewardApy
	} = router.query;
	const advancedFilter = useAdvancedFilter(initialData, config);

	projects = useMemo(() => arrayFromString(projects), [projects]);
	chains = useMemo(() => arrayFromString(chains), [chains]);
	category = useMemo(() => arrayFromString(category), [category]);
	const [displayedApyRange, setDisplayedApyRange] = useState([+apyFrom, +apyTo]);

	const allChains = useMemo(
		() => Array.from(new Set(initialData.map((item) => item.chain))) as Array<string>,
		[initialData]
	);
	const chainOptions = allChains.map((chain: string) => ({
		value: chain,
		label: chain,
		logoURI: chainIconUrl(chain?.toLowerCase())
	}));

	const allProjects = useMemo(() => Object.keys(config), [config]);
	const projectOptions = useMemo(
		() =>
			allProjects.map((project) => ({
				value: project,
				label: config?.[project]?.name,
				logoURI: `https://icons.llamao.fi/icons/protocols/${project}?w=48&h=48`
			})),
		[allProjects, config]
	);

	const allTokens = useMemo(
		() =>
			(Array.from(new Set(initialData.map((item) => item.symbol))) as Array<string>).filter(
				(s: string) => s.split('-')?.length === 1
			),
		[initialData]
	);
	const tokensOptions = allTokens.map((token) => ({
		value: token,
		label: token
	}));

	const allCategories = useMemo(
		() =>
			Array.from(
				new Set(
					Object.values(config as Record<string, Record<string, string>>).map((c: Record<string, string>) => c.category)
				)
			),
		[config]
	);

	const categoryOptions = allCategories.map((category) => ({
		value: category,
		label: category
	}));

	const handleFilterChanges = useCallback(
		debounce((query) => {
			const filteredData = advancedFilter(query);
			setData(filteredData);
		}, 500),
		[advancedFilter, setData]
	);
	useEffect(() => {
		handleFilterChanges({ chains, projects, search, apyFrom, apyTo, tvlFrom, tvlTo, category, includeRewardApy });
	}, [chains, projects, search, apyFrom, apyTo, tvlFrom, tvlTo, handleFilterChanges, category, includeRewardApy]);

	const handleQueryChange = useCallback(
		(value, key) => {
			let query;
			if (key === 'apy') {
				const [newApyFrom, newApyTo] = value;
				query = { ...router.query, apyFrom: newApyFrom, apyTo: newApyTo };
			} else {
				query = { ...router.query, [key]: value };
			}

			router.push({ query }, undefined, { shallow: true });
			handleFilterChanges(query);
		},
		[handleFilterChanges, router]
	);

	const handleChainChange = (options) => {
		const chains = options.map((o) => o.value);
		handleQueryChange(chains, 'chains');
	};

	const handleProjectChange = (options) => {
		handleQueryChange(
			options.map((p) => p.value),
			'projects'
		);
	};

	const handleCategoryChange = (options) => {
		handleQueryChange(
			options.map((p) => p.value),
			'category'
		);
	};

	const handleSymbolSearch = useCallback((value) => {
		handleQueryChange(value, 'search');
	}, []);

	const handleTvlFromChange = useCallback(
		(e) => {
			const value = e.target.value;
			handleQueryChange(value, 'tvlFrom');
		},
		[handleQueryChange]
	);

	const handleTvlToChange = useCallback(
		(e) => {
			const value = e.target.value;
			handleQueryChange(value, 'tvlTo');
		},
		[handleQueryChange]
	);

	const changeApyRange = useCallback(
		(values) => {
			handleQueryChange(values, 'apy');
		},
		[handleQueryChange]
	);

	const handleApyRangeChange = useCallback(
		(values) => {
			setDisplayedApyRange(values);
		},
		[setDisplayedApyRange]
	);

	const handleResetFilters = () => {
		setDisplayedApyRange([0, 200]);

		router.push({ query: { tab: 'earn' } }, undefined, { shallow: true });
	};
	const thumbColor = useColorModeValue('gray.300', 'gray.600');

	return (
		<FiltersBody>
			<Box>
				<Box mb={2}>
					<Text fontWeight="medium" mb={2} fontSize={'16px'} display={'flex'} justifyContent={'space-between'}>
						Symbol <CloseIcon onClick={() => closeFilters()} cursor={'pointer'} />
					</Text>
					<MultiSelect
						itemCount={allTokens.length}
						options={tokensOptions}
						value={
							search
								? {
										label: search,
										value: search
									}
								: null
						}
						onChange={(value) => handleSymbolSearch((value as { value: string } | undefined)?.value)}
						placeholder="Search symbols..."
						cacheOptions
						defaultOptions
						filterOption={createFilter({ ignoreAccents: false })}
						components={{ MenuList }}
						isClearable
					/>
				</Box>
				<Box>
					<Text fontWeight="medium" mb={2} fontSize={'16px'}>
						Chain
					</Text>
					<MultiSelect
						isMulti
						options={chainOptions}
						value={chains.map((c) => ({ value: c, label: c, logoURI: chainIconUrl(c) }))}
						onChange={handleChainChange}
						placeholder="Select chains..."
						isClearable
						components={{ MenuList }}
					/>
				</Box>
			</Box>

			<Box>
				<Text fontWeight="medium" mb={2} fontSize={'16px'}>
					Project
				</Text>
				<MultiSelect
					isMulti
					options={projectOptions}
					value={projects.map((p) => ({
						value: p,
						label: config?.[p]?.name,
						logoURI: `https://icons.llamao.fi/icons/protocols/${p}?w=48&h=48`
					}))}
					onChange={handleProjectChange}
					placeholder="Select projects..."
					itemCount={allProjects.length}
					cacheOptions
					defaultOptions
					filterOption={createFilter({ ignoreAccents: false })}
					components={{ MenuList }}
					isClearable
				/>
			</Box>
			<Box>
				<Text fontWeight="medium" mb={2} fontSize={'16px'}>
					Category
				</Text>
				<MultiSelect
					isMulti
					options={categoryOptions}
					value={
						category.map((p) => ({
							value: p,
							label: p
						})) || []
					}
					onChange={handleCategoryChange}
					placeholder="Select categories..."
					itemCount={categoryOptions.length}
					cacheOptions
					defaultOptions
					filterOption={createFilter({ ignoreAccents: false })}
					components={{ MenuList }}
					isClearable
				/>
			</Box>

			<Box>
				<Text fontWeight="medium" mb={2} fontSize={'16px'}>
					TVL USD
				</Text>
				<Flex gap={2}>
					<Input
						placeholder="From"
						onChange={(e) => handleTvlFromChange(e)}
						bg="rgb(20, 22, 25)"
						borderColor="transparent"
						fontSize={'14px'}
						_focusVisible={{ outline: 'none' }}
						value={tvlFrom}
					/>
					<Input
						placeholder="To"
						onChange={(e) => handleTvlToChange(e)}
						bg="rgb(20, 22, 25)"
						borderColor="transparent"
						fontSize={'14px'}
						_focusVisible={{ outline: 'none' }}
						value={tvlTo}
					/>
				</Flex>
			</Box>

			<Box mb="2">
				<Text fontWeight="medium" mb={6} fontSize={'16px'}>
					APY
				</Text>
				<Flex justify="center">
					<Box width="320px">
						<RangeSlider
							// eslint-disable-next-line jsx-a11y/aria-proptypes
							aria-label={['min', 'max']}
							defaultValue={[0, 200]}
							value={[displayedApyRange[0], displayedApyRange[1]] as any}
							min={0}
							max={200}
							step={1}
							onChange={handleApyRangeChange}
							onChangeEnd={(values) => changeApyRange(values)}
						>
							<RangeSliderTrack>
								<RangeSliderFilledTrack />
							</RangeSliderTrack>
							<RangeSliderThumb
								index={0}
								bg={thumbColor}
								_focus={{ boxShadow: 'outline' }}
								_active={{ bg: 'gray.400' }}
							>
								<Text fontSize="sm" transform="translateY(-100%)">
									{displayedApyRange[0].toFixed()}%
								</Text>
							</RangeSliderThumb>
							<RangeSliderThumb
								index={1}
								bg={thumbColor}
								_focus={{ boxShadow: 'outline' }}
								_active={{ bg: 'gray.400' }}
							>
								<Text fontSize="sm" transform="translateY(-100%)">
									{displayedApyRange[1].toFixed()}%
								</Text>
							</RangeSliderThumb>
						</RangeSlider>
					</Box>
				</Flex>
			</Box>
			<Box>
				<Text fontWeight={'medium'}>Include Reward APY</Text>
				<Flex>
					<Switch
						size="md"
						checked={router.query.includeRewardApy === 'true'}
						onChange={(e) => handleQueryChange(e.target.checked, 'includeRewardApy')}
					/>
				</Flex>
			</Box>
			<Box
				position={'sticky'}
				height={'40px'}
				bottom={0}
				bgColor="rgb(34, 36, 42)"
				display={'flex'}
				justifyContent={'center'}
			>
				<Button color="#2172E5" variant={'link'} gap="4px" fontWeight={'normal'} onClick={() => handleResetFilters()}>
					Reset Filters <DeleteIcon />
				</Button>
			</Box>
		</FiltersBody>
	);
};

const FiltersBody = styled.div`
	max-width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	gap: 8px;
	padding: 20px;
	padding-bottom: 0;
`;
export default Filters;
