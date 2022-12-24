import * as React from 'react';
import styled from 'styled-components';
import BigNumber from 'bignumber.js';
import { Box, Flex, Skeleton } from '@chakra-ui/react';
import { ArrowRight } from 'react-feather';
import { initialLiquidity } from '~/components/Aggregator/constants';
import type { IToken } from '~/types';
import { useGetInitialTokenLiquidity, useGetTokensLiquidity } from '~/queries/useGetTokenLiquidity';
import dynamic from 'next/dynamic';
import { getChartData } from '~/utils/getChartData';
import { useGetPrice } from '~/queries/useGetPrice';

interface ISlippageChart {
	chartData: Array<[number, number]>;
	fromTokenSymbol: string;
	toTokenSymbol: string;
}

const SlippageChart = dynamic(() => import('../SlippageChart'), { ssr: false }) as React.FC<ISlippageChart>;

export function LiquidityByToken({ fromToken, toToken, chain }: { fromToken: IToken; toToken: IToken; chain: string }) {
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
				toTokenDecimals: toToken.decimals
			}),

		[initialRoutes, toToken.decimals, addlLiqRoutes]
	);

	const filteredNewliqValues = newLiquidityValues.filter((newliq) => !liquidity.includes(newliq));

	if (filteredNewliqValues.length) {
		setLiquidity((prevLiq) => [...prevLiq, ...filteredNewliqValues].sort((a, b) => a - b));
	}

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
						const topRoute = initialRoutes?.find((t) => t[0] === `${liqAmount}`)?.[1] ?? null;

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

			<Box height="400px">
				<SlippageChart chartData={chartData} fromTokenSymbol={fromToken.symbol} toTokenSymbol={toToken.symbol} />
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
