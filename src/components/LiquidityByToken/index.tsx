import * as React from 'react';
import styled from 'styled-components';
import BigNumber from 'bignumber.js';
import { Box, Flex, Skeleton } from '@chakra-ui/react';
import { ArrowRight } from 'react-feather';
import { initialLiquidity } from '~/components/Aggregator/constants';
import type { IToken } from '~/types';
import { useGetTokenLiquidity } from '~/queries/useGetTokenLiquidity';
import dynamic from 'next/dynamic';

interface ISlippageChart {
	chartData: Array<[number, number]>;
	fromTokenSymbol: string;
	toTokenSymbol: string;
}

const SlippageChart = dynamic(() => import('../SlippageChart'), { ssr: false }) as React.FC<ISlippageChart>;

export function LiquidityByToken({ fromToken, toToken, chain }: { fromToken: IToken; toToken: IToken; chain: string }) {
	const { data: topRoutes, isLoading } = useGetTokenLiquidity({ fromToken, toToken, chain });

	const { chartData } = React.useMemo(() => {
		// price at $500 liquidity
		const currentPrice = topRoutes?.[0]?.[1]?.price?.amountReturned ?? null;

		const chartData = [];

		if (currentPrice) {
			topRoutes?.forEach(([nofOfTokensToSwap, { price }]) => {
				const amountReturned = price?.amountReturned ?? null;

				if (amountReturned) {
					const expectedPrice = Number(currentPrice) * (Number(nofOfTokensToSwap) / 500);

					const slippage = ((Number(amountReturned) - expectedPrice) / expectedPrice) * 100;

					chartData.push([
						Number(nofOfTokensToSwap),
						Number(Math.abs(slippage).toFixed(2)),
						BigNumber(amountReturned)
							.div(10 ** Number(toToken.decimals || 18))
							.toFixed(3)
					]);
				}
			});
		}

		return { topRoutes, chartData };
	}, [topRoutes, toToken.decimals]);

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
						const topRoute = topRoutes?.find((t) => t[0] === `${liqAmount}`)?.[1] ?? null;

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
