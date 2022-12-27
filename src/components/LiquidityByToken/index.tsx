import * as React from 'react';
import dynamic from 'next/dynamic';
import styled from 'styled-components';
import BigNumber from 'bignumber.js';
import {
	Box,
	Flex,
	FormControl,
	FormLabel,
	RangeSlider,
	RangeSliderFilledTrack,
	RangeSliderMark,
	RangeSliderThumb,
	RangeSliderTrack,
	Skeleton,
	Switch,
	Text
} from '@chakra-ui/react';
import { ArrowRight } from 'react-feather';
import { initialLiquidity } from '~/components/Aggregator/constants';
import { useGetInitialTokenLiquidity, useGetTokensLiquidity } from '~/queries/useGetTokenLiquidity';
import { useGetPrice } from '~/queries/useGetPrice';
import { getChartData } from '~/utils/getChartData';
import type { IToken } from '~/types';
import { useRouter } from 'next/router';
import { useGetMcap } from '~/queries/useGetMCap';

interface ISlippageChart {
	chartData: Array<[number, number]>;
	fromTokenSymbol: string;
	toTokenSymbol: string;
	mcap: number | null;
}

const SlippageChart = dynamic(() => import('../SlippageChart'), { ssr: false }) as React.FC<ISlippageChart>;

export function LiquidityByToken({ fromToken, toToken, chain }: { fromToken: IToken; toToken: IToken; chain: string }) {
	const router = useRouter();

	const { minSlippage, maxSlippage, showTokenMcap } = router.query;

	const minimumSlippage =
		typeof minSlippage === 'string' && !Number.isNaN(Number(minSlippage)) ? Number(minSlippage) : 0;
	const maximumSlippage =
		typeof maxSlippage === 'string' && !Number.isNaN(Number(maxSlippage)) ? Number(maxSlippage) : 0;

	const fromTokenMCapPercentage = showTokenMcap === 'true';

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
		fromTokenPrice: tokenAndGasPrices?.fromTokenPrice ?? 0,
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
				fromTokenDecimals: fromToken.decimals,
				price: fromToken.symbol === 'WBTC' ? 10000 : 500,
				minimumSlippage,
				maximumSlippage
			}),

		[
			initialRoutes,
			toToken.decimals,
			fromToken.decimals,
			fromToken.symbol,
			addlLiqRoutes,
			minimumSlippage,
			maximumSlippage
		]
	);

	const filteredNewliqValues = newLiquidityValues.filter((newliq) => !liquidity.includes(newliq));

	if (filteredNewliqValues.length) {
		setLiquidity((prevLiq) => [...prevLiq, ...filteredNewliqValues].sort((a, b) => a - b));
	}

	const [sliderValue, setSliderValue] = React.useState([0, 100]);

	const { data: fromTokenMcap } = useGetMcap({ id: fromToken.geckoId });

	const mcap = fromTokenMcap && fromTokenMCapPercentage ? Math.round(fromTokenMcap) : null;

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

			<Box minH="745px">
				{chartData.length > 0 && (
					<>
						<Flex
							alignItems="center"
							justifyContent="space-between"
							gap="16px"
							flexWrap="wrap"
							margin="24px 32px 24px auto"
							w="full"
						>
							<FormControl display="flex" alignItems="center" gap="8px" w="fit-content">
								{fromToken.geckoId && (
									<Switch
										id="coinMcap"
										checked={fromTokenMCapPercentage}
										onChange={() => {
											router.push(
												{
													pathname: router.pathname,
													query: { ...router.query, showTokenMcap: !fromTokenMCapPercentage }
												},
												undefined,
												{ shallow: true }
											);
										}}
									/>
								)}
								<FormLabel htmlFor="coinMcap" mb="0">
									{`Show % of ${fromToken.symbol} Mcap`}
								</FormLabel>
							</FormControl>

							<Flex as="form" alignItems="center" flexDir="row" gap="20px" width="100%" maxW="360px">
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
											{
												pathname: router.pathname,
												query: { ...router.query, minSlippage: val[0], maxSlippage: val[1] }
											},
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
						</Flex>

						<Box height="400px">
							<SlippageChart
								chartData={chartData}
								fromTokenSymbol={fromToken.symbol}
								toTokenSymbol={toToken.symbol}
								mcap={mcap}
							/>
						</Box>

						<Flex flexDir="column" gap="20px" marginY="36px">
							<Text as="p" fontSize="1rem">
								This tool gets price quotes on 10 different dex aggregators at different levels and displays the results
								over a chart, so the resulting data aggregates all liquidity across the hundreds of dexs that all those
								aggregators have integrated, including stuff like limit orders, thus we are quite confident that this
								will accurately report all on-chain liquidity.
							</Text>
							<Text as="p" fontSize="1rem">
								You can use this tool to find out how much needs to be sold to cause a price drop of 10%, 20%... or just
								to see how deep the liquidity is for a given token. It'll be especially useful for defi risk teams.
							</Text>
							<Text as="p" fontSize="1rem">
								The chart will keep updating with more data as long as this window is open, so if you want your chart to
								be more granular just wait for a bit, you'll notice how the chart adjust in real time.
							</Text>
							<Text as="p" fontSize="1rem">
								There's currently a bug that causes spikes to be formed if you switch to a different tab while the chart
								is being created, so please avoid doing that.
							</Text>
						</Flex>
					</>
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
