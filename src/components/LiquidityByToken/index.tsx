import styled from 'styled-components';
import BigNumber from 'bignumber.js';
import { Box, Flex, Skeleton } from '@chakra-ui/react';
import { ArrowRight } from 'react-feather';
import { liquidity } from '~/components/Aggregator/constants';
import type { IToken } from '~/types';
import { useGetTokenLiquidity } from '~/queries/useGetTokenLiquidity';

export function LiquidityByToken({ fromToken, toToken, chain }: { fromToken: IToken; toToken: IToken; chain: string }) {
	const { data, isLoading } = useGetTokenLiquidity({ fromToken, toToken, chain });

	const topRoutes =
		data?.map(([liq, routes]) => {
			const sortedRoutes = routes.sort(
				(a, b) => Number(b.price?.amountReturned ?? 0) - Number(a.price?.amountReturned ?? 0)
			);

			const topRoute = sortedRoutes.length > 0 ? sortedRoutes[0] : null;

			return [liq, topRoute] as [
				string,
				{
					price?: {
						amountReturned: string;
						name: string;
					};
					txData: any;
					name: any;
					airdrop: boolean;
					fromAmount: string;
				}
			];
		}) ?? [];

	return (
		<Table>
			<caption>
				<Flex alignItems="center" flexWrap="nowrap" justifyContent="center" gap={1}>
					<Flex as="span" alignItems="center" gap="2px" flexWrap="nowrap">
						<img
							src={fromToken.logoURI}
							alt=""
							style={{ width: '20px', height: '20px', objectFit: 'cover', display: ' flex' }}
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
				{liquidity.map((liq) => {
					const topRoute = topRoutes.find((t) => t[0] === `${liq.amount}+${liq.slippage}`)?.[1] ?? null;

					return (
						<tr key={toToken.address + liq.amount + liq.slippage}>
							<td>{`${liq.amount.toLocaleString()} ${fromToken.symbol}`}</td>
							<td>
								{isLoading ? (
									<Skeleton height="16px" width="100%" maxWidth="24ch" margin="auto" />
								) : (
									<>
										{topRoute?.price?.amountReturned
											? `${BigNumber(topRoute?.price?.amountReturned ?? 0)
													.div(10 ** Number(toToken.decimals || 18))
													.toFixed(3)} ${toToken.symbol} via ${topRoute?.name}`
											: ''}
									</>
								)}
							</td>
						</tr>
					);
				})}
			</tbody>
		</Table>
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
