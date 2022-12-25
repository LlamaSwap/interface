import * as React from 'react';
import dynamic from 'next/dynamic';
import styled from 'styled-components';
import BigNumber from 'bignumber.js';
import {
	Box,
	Flex,
	RangeSlider,
	RangeSliderFilledTrack,
	RangeSliderMark,
	RangeSliderThumb,
	RangeSliderTrack,
	Skeleton,
	Text
} from '@chakra-ui/react';
import { ArrowRight } from 'react-feather';
import { initialLiquidity } from '~/components/Aggregator/constants';
import { useGetInitialTokenLiquidity, useGetTokensLiquidity } from '~/queries/useGetTokenLiquidity';
import { useGetPrice } from '~/queries/useGetPrice';
import { getChartData } from '~/utils/getChartData';
import type { IToken } from '~/types';
import { useRouter } from 'next/router';

interface ISlippageChart {
	chartData: Array<[number, number]>;
	fromTokenSymbol: string;
	toTokenSymbol: string;
}

const SlippageChart = dynamic(() => import('../SlippageChart'), { ssr: false }) as React.FC<ISlippageChart>;

export function LiquidityByToken({ fromToken, toToken, chain }: { fromToken: IToken; toToken: IToken; chain: string }) {
	const router = useRouter();

	const { data: tokenAndGasPrices, isLoading: fetchingTokenPrices } = useGetPrice({
		chain,
		toToken: toToken?.address,
		fromToken: fromToken?.address,
		skipRefetch: true
	});

	const { data: initialRoutes, isLoading: fetchingInitialTokenLiq } = useGetInitialTokenLiquidity({
		fromToken,
		toToken,
		chain,
		gasPriceData: tokenAndGasPrices?.gasPriceData,
		gasTokenPrice: tokenAndGasPrices?.gasTokenPrice,
		fromTokenPrice: tokenAndGasPrices?.fromTokenPrice,
		toTokenPrice: tokenAndGasPrices?.toTokenPrice
	});

	const isLoading = fetchingTokenPrices || fetchingInitialTokenLiq;

	const [liquidity, setLiquidity] = React.useState([]);

	const { data: addlLiqRoutes } = useGetTokensLiquidity({
		fromToken,
		toToken,
		chain,
		gasPriceData: tokenAndGasPrices?.gasPriceData,
		gasTokenPrice: tokenAndGasPrices?.gasTokenPrice,
		fromTokenPrice: tokenAndGasPrices?.fromTokenPrice,
		toTokenPrice: tokenAndGasPrices?.toTokenPrice,
		liquidity
	});

	const { chartData, newLiquidityValues } = React.useMemo(
		() =>
			getChartData({
				routes: [...(initialRoutes || []), ...(addlLiqRoutes || [])]?.sort((a, b) => a[0] - b[0]),
				toTokenDecimals: toToken.decimals,
				price: fromToken.symbol === 'WBTC' ? 10000 : 500
			}),

		[initialRoutes, toToken.decimals, fromToken.symbol, addlLiqRoutes]
	);

	const filteredNewliqValues = newLiquidityValues.filter((newliq) => !liquidity.includes(newliq));

	if (filteredNewliqValues.length) {
		setLiquidity((prevLiq) => [...prevLiq, ...filteredNewliqValues].sort((a, b) => a - b));
	}

	const [sliderValue, setSliderValue] = React.useState([0, 100]);

	return (
		<Flex flexDir="column" gap="24px">
			<Table>
				<caption>
					<Flex alignItems="center" flexWrap="nowrap" justifyContent="center" gap={1}>
						<Flex as="span" alignItems="center" gap="2px" flexWrap="nowrap">
							<img
								src={fromToken.logoURI}
								alt=""
								style={{ width: '20px', height: '20px', objectFit: 'cover', display: ' flex', borderRadius: '100%' }}
							/>
							<Box as="span" fontWeight={500} fontSize={16}>
								{fromToken.symbol}
							</Box>
						</Flex>
						<ArrowRight width={16} height={16} display="block" />
						<Flex as="span" alignItems="center" gap="2px" flexWrap="nowrap">
							<img
								src={toToken.logoURI}
								alt=""
								style={{ width: '20px', height: '20px', objectFit: 'cover', display: ' flex' }}
							/>
							<Box as="span" fontWeight={500} fontSize={16}>
								{toToken.symbol}
							</Box>
						</Flex>
					</Flex>
				</caption>
				<thead>
					<tr>
						<th>Trade</th>
						<th>Receive</th>
					</tr>
				</thead>
				<tbody>
					{initialLiquidity.map((liqAmount) => {
						const topRoute = initialRoutes?.find((t) => t[0] === liqAmount)?.[1] ?? null;

						return (
							<tr key={toToken.address + liqAmount}>
								<td>{`$${liqAmount.toLocaleString()} of ${fromToken.symbol}`}</td>
								<td>
									{isLoading ? (
										<Skeleton height="16px" width="100%" maxWidth="24ch" margin="auto" />
									) : (
										<>
											{topRoute?.price?.amountReturned
												? `${Number(
														BigNumber(topRoute?.price?.amountReturned ?? 0)
															.div(10 ** Number(toToken.decimals || 18))
															.toFixed(3)
												  ).toLocaleString()} ${toToken.symbol} via ${topRoute?.name}`
												: ''}
										</>
									)}
								</td>
							</tr>
						);
					})}
				</tbody>
			</Table>

			<Flex
				as="form"
				alignItems="center"
				flexDir="row"
				gap="20px"
				margin="24px 32px -24px auto"
				width="100%"
				maxW="360px"
			>
				<Text as="label" whiteSpace="nowrap">
					Slippage Range
				</Text>
				<RangeSlider
					aria-label={['min slippage', 'max slippage']}
					min={0}
					max={100}
					defaultValue={[0, 100]}
					step={1}
					onChange={(val) => setSliderValue(val)}
					onChangeEnd={(val) => {
						router.push(
							{ pathname: router.pathname, query: { ...router.query, minSlippage: val[0], maxSlippage: val[1] } },
							undefined,
							{ shallow: true }
						);
					}}
				>
					<RangeSliderMark value={sliderValue[0]} textAlign="center" color="white" mt="-8" ml="-5" w="12">
						{sliderValue[0]}%
					</RangeSliderMark>
					<RangeSliderMark value={sliderValue[1]} textAlign="center" color="white" mt="-8" ml="-5" w="12">
						{sliderValue[1]}%
					</RangeSliderMark>

					<RangeSliderTrack>
						<RangeSliderFilledTrack bg="#2563eb" />
					</RangeSliderTrack>
					<RangeSliderThumb index={0} />
					<RangeSliderThumb index={1} />
				</RangeSlider>
			</Flex>

			<Box height="422px">
				{chartData.length > 0 && (
					<SlippageChart chartData={chartData} fromTokenSymbol={fromToken.symbol} toTokenSymbol={toToken.symbol} />
				)}
			</Box>
		</Flex>
	);
}

const Table = styled.table`
	table-layout: fixed;
	width: 100%;

	th,
	td,
	caption {
		padding: 4px;
		font-size: 1rem;
		font-weight: 400;
		text-align: center;
		border: 1px solid ${({ theme }) => theme.bg3};
	}

	caption {
		border-bottom: none;
	}
`;
