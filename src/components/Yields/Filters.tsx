import { debounce } from 'lodash';
import React, { useState, useCallback, useMemo } from 'react';
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
	useColorModeValue
} from '@chakra-ui/react';
import MultiSelect from '../MultiSelect';
import { chainIconUrl } from '../Aggregator/nativeTokens';
import { useRouter } from 'next/router';
import { FixedSizeList as List } from 'react-window';
import { createFilter } from 'react-select';

const wrapSingleQueryString = (value) => (Array.isArray(value) ? value : [value]);

export const MenuList = (props) => {
	const { options, children, maxHeight, getValue } = props;
	const [value] = getValue();
	const initialOffset = options.indexOf(value) * 35;

	return (
		<List height={maxHeight} itemCount={children.length} itemSize={35} initialScrollOffset={initialOffset}>
			{({ index, style }) => <div style={style}>{children[index]}</div>}
		</List>
	);
};

const Filters = ({ setData, initialData }) => {
	const router = useRouter();
	let {
		chains = [],
		projects = [],
		search = '',
		apyFrom = 0,
		apyTo = 200,
		tvlFrom = '',
		tvlTo = ''
	} = router.query as any;
	[chains, projects] = [wrapSingleQueryString(chains), wrapSingleQueryString(projects)];

	const [displayedApyRange, setDisplayedApyRange] = useState([+apyFrom, +apyTo]);

	const allChains = useMemo(() => Array.from(new Set(initialData.map((item) => item.chain))), [initialData.length]);
	const chainOptions = allChains.map((chain: string) => ({
		value: chain,
		label: chain,
		logoURI: chainIconUrl(chain?.toLowerCase())
	}));

	const allProjects = useMemo(
		() => Array.from(new Set(initialData.map((item) => item.config.name))),
		[initialData.length]
	);

	const projectOptions = allProjects.map((project) => ({
		value: project,
		label: project,
		logoURI: `https://icons.llamao.fi/icons/protocols/${project}?w=48&h=48`
	}));

	const allTokens = useMemo(
		() => Array.from(new Set(initialData.map((item) => item.symbol))).filter((s: string) => s.split('-')?.length === 1),
		[initialData.length]
	);
	const tokensOptions = allTokens.map((token) => ({
		value: token,
		label: token
	}));

	const handleFilterChanges = useCallback(
		debounce((query) => {
			let {
				chains = [],
				projects = [],
				search = '',
				apyFrom = 0,
				apyTo = 200,
				tvlFrom = '',
				tvlTo = ''
			} = query as any;
			[chains, projects] = [wrapSingleQueryString(chains), wrapSingleQueryString(projects)];

			setData(() => {
				if (chains.length === 0 && projects.length === 0 && search === '' && apyFrom[0] === 0 && apyTo[1] === 200) {
					return initialData;
				}

				return initialData.filter((item) => {
					const chainMatch = chains.length === 0 || chains.includes(item.chain);
					const projectMatch = projects.length === 0 || projects.includes(item.config.name);
					const symbolMatch = search === '' || item.symbol.toLowerCase().includes(search.toLowerCase());
					console.log({ search, symbolMatch, item });
					const apyMatch = apyTo[1] === 200 ? true : item.apyMean30d >= +apyFrom && item.apyMean30d <= +apyTo;
					const tvlFromMatch = tvlFrom === '' || item.tvlUsd >= +tvlFrom;
					const tvlToMatch = tvlTo === '' || item.tvlUsd <= +tvlTo;

					return chainMatch && projectMatch && symbolMatch && apyMatch && tvlFromMatch && tvlToMatch;
				});
			});
		}, 500),
		[chains, projects, search, apyFrom, apyTo, initialData, setData, tvlFrom, tvlTo]
	);

	const handleQueryChange = useCallback(
		(value: string, key: string) => {
			let query;
			if (key === 'apy') {
				const [apyFrom, apyTo] = value;
				query = { ...router.query, apyFrom, apyTo };
			} else query = { ...router.query, [key]: value };

			router.push({ query }, undefined, { shallow: true });
			handleFilterChanges({ ...query, [key]: value });
		},
		[handleFilterChanges, router]
	);

	const handleChainChange = (options) => {
		handleQueryChange(
			options.map((option) => option.value),
			'chains'
		);
	};

	const handleProjectChange = (options) => {
		handleQueryChange(
			options.map((option) => option.value),
			'projects'
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

	const changeApyRange = useCallback((values) => {
		handleQueryChange(values, 'apy');
	}, []);

	const handleApyRangeChange = useCallback(
		(values) => {
			setDisplayedApyRange(values);
		},
		[setDisplayedApyRange, handleQueryChange]
	);

	const handleResetFilters = () => {
		setDisplayedApyRange([0, 200]);
		setData(initialData);
		router.push({ query: { tab: 'earn' } }, undefined, { shallow: true });
	};

	const thumbColor = useColorModeValue('gray.300', 'gray.600');

	return (
		<Flex direction="column" gap={4} minWidth={'260px'} padding={'20px'}>
			<Box>
				<Text fontWeight="bold" mb={4} fontSize={16}>
					Filters
				</Text>
				<Box mb={2}>
					<Text fontWeight="medium" mb={2}>
						Symbol
					</Text>
					<MultiSelect
						itemCount={allTokens.length}
						options={tokensOptions}
						value={{
							label: search,
							value: search
						}}
						onChange={(value: { value: string }) => handleSymbolSearch(value?.value)}
						placeholder="Search symbols..."
						components={{ MenuList }}
						cacheOptions
						defaultOptions
						filterOption={createFilter({ ignoreAccents: false })}
					/>
				</Box>
				<Box>
					<Text fontWeight="medium" mb={2}>
						Chain
					</Text>
					<MultiSelect
						isMulti
						options={chainOptions}
						value={chains.map((chain) => ({
							value: chain,
							label: chain,
							logoURI: chainIconUrl(chain?.toLowerCase())
						}))}
						onChange={handleChainChange}
						placeholder="Select chains..."
					/>
				</Box>
			</Box>

			<Box>
				<Text fontWeight="medium" mb={2}>
					Project
				</Text>
				<MultiSelect
					isMulti
					options={projectOptions}
					value={projects.map((project) => ({
						value: project,
						label: project,
						logoURI: `https://icons.llamao.fi/icons/protocols/${project}?w=48&h=48`
					}))}
					onChange={handleProjectChange}
					placeholder="Select projects..."
				/>
			</Box>

			<Box>
				<Text fontWeight="medium" mb={2}>
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

			<Box>
				<Text fontWeight="medium" mb={6}>
					APY
				</Text>
				<Flex justify="center">
					<Box width="240px">
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
			<Flex justify="flex-end">
				<Button size={'sm'} onClick={handleResetFilters}>
					Reset Filters
				</Button>
			</Flex>
		</Flex>
	);
};

export default Filters;
