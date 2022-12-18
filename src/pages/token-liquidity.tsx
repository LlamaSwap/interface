import * as React from 'react';
import { useRouter } from 'next/router';
import BigNumber from 'bignumber.js';
import { Box, Flex, FormControl, FormLabel, Heading } from '@chakra-ui/react';
import { ArrowRight } from 'react-feather';
import Layout from '~/layout';
import { getTokenList } from '~/components/Aggregator';
import { chainsMap, liquidity, topTokens } from '~/components/Aggregator/constants';
import ReactSelect from '~/components/MultiSelect';
import { getAllChains } from '~/components/Aggregator/router';
import { useGetTokenLiquidity } from '~/queries/useGetTokenLiquidity';
import type { IToken } from '~/types';
import styled from 'styled-components';

export async function getStaticProps() {
	return getTokenList();
}

const chains = getAllChains();

export default function TokenLiquidity({ tokenlist }) {
	const router = useRouter();

	const { chain, token } = router.query;

	const chainName = typeof chain === 'string' ? chain.toLowerCase() : null;

	const fromTokenSymbol = typeof token === 'string' ? token.toLowerCase() : null;

	const { selectedChain, selectedToken, chainTokenList, topTokensOfChain } = React.useMemo(() => {
		const chainTokenList: Array<IToken> = tokenlist && chainName ? tokenlist[chainsMap[chainName]] : null;
		const tokenList = chainTokenList ? chainTokenList.map((t) => ({ ...t, label: t.symbol, value: t.address })) : null;

		const selectedChain = chains.find((c) => c.value === chainName);
		const selectedToken = chainTokenList?.find(
			(t) => t.symbol.toLowerCase() === fromTokenSymbol || t.address.toLowerCase() === fromTokenSymbol
		);

		const topTokensOfChain: Array<IToken> =
			chainName && selectedToken && tokenList
				? topTokens[chainName]
						.map((topToken) => {
							const values = tokenList.find((t) => t.symbol === topToken);

							if (values && topToken.toLowerCase() !== selectedToken.symbol.toLowerCase()) {
								return {
									...values,
									value: values.address,
									label: values.symbol
								};
							}

							return null;
						})
						.filter((t) => !!t)
				: [];

		return {
			selectedChain,
			selectedToken: selectedToken
				? { ...selectedToken, label: selectedToken.symbol, value: selectedToken.address }
				: null,
			chainTokenList: tokenList,
			topTokensOfChain
		};
	}, [chainName, fromTokenSymbol, tokenlist]);

	const { data } = useGetTokenLiquidity({ chain: chainName, fromToken: selectedToken, topTokensOfChain });

	const onChainChange = (chain) => {
		router.push({ pathname: router.pathname, query: { ...router.query, chain: chain.value } }, undefined, {
			shallow: true
		});
	};

	const onTokenChange = (token) => {
		router.push({ pathname: router.pathname, query: { ...router.query, token: token.symbol } }, undefined, {
			shallow: true
		});
	};

	return (
		<Layout title={`Token Liquidity - LlamaSwap`} defaultSEO>
			<Heading alignSelf="center">Token Liquidity</Heading>

			<Flex gap="16px" marginTop="40px">
				<FormControl display="flex" flexDirection="column" justifyContent={'center'}>
					<FormLabel htmlFor="privacy-switch" pb="0" lineHeight={1}>
						Chain
					</FormLabel>
					<ReactSelect options={chains} value={selectedChain} onChange={onChainChange} style={{ flex: 1 }} />
				</FormControl>
				<FormControl display="flex" flexDirection="column" justifyContent={'center'}>
					<FormLabel htmlFor="privacy-switch" pb="0" lineHeight={1}>
						Token
					</FormLabel>
					<ReactSelect options={chainTokenList} value={selectedToken} onChange={onTokenChange} style={{ flex: 1 }} />
				</FormControl>
			</Flex>

			<Flex flexDir="column" gap={16} marginY={4} overflowX="auto">
				{topTokensOfChain.length > 0 &&
					topTokensOfChain.map((token) => {
						const tokenLiquidity = data.find((d) => d[0] === token.symbol)?.[1] ?? [];

						return (
							<Table key={token.address + selectedToken.address}>
								<caption>
									<Flex alignItems="center" flexWrap="nowrap" justifyContent="center" gap={1}>
										<Flex as="span" alignItems="center" gap="2px" flexWrap="nowrap">
											<img
												src={selectedToken.logoURI}
												alt=""
												style={{ width: '20px', height: '20px', objectFit: 'cover', display: ' flex' }}
											/>
											<Box as="span" fontWeight={500} fontSize={16}>
												{selectedToken.symbol}
											</Box>
										</Flex>
										<ArrowRight width={16} height={16} display="block" />
										<Flex as="span" alignItems="center" gap="2px" flexWrap="nowrap">
											<img
												src={token.logoURI}
												alt=""
												style={{ width: '20px', height: '20px', objectFit: 'cover', display: ' flex' }}
											/>
											<Box as="span" fontWeight={500} fontSize={16}>
												{token.symbol}
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
										const routes = (
											tokenLiquidity.find((t) => t[0] === `${liq.amount}+${liq.slippage}`)?.[1] ?? []
										).sort((a, b) => b.price?.amountReturned - a.price?.amountReturned);

										const topRoute = routes.length > 0 ? routes[0] : {};

										console.log({ topRoute });

										return (
											<tr key={token.address + liq.amount + liq.slippage}>
												<td>{`${liq.amount.toLocaleString()} ${selectedToken.symbol}  (${liq.slippage}% slippage)`}</td>
												<td>
													{topRoute.price?.amountReturned
														? `${BigNumber(topRoute.price?.amountReturned ?? 0)
																.div(10 ** Number(token.decimals || 18))
																.toFixed(3)} ${token.symbol} via ${topRoute.name}`
														: ''}
												</td>
											</tr>
										);
									})}
								</tbody>
							</Table>
						);
					})}
			</Flex>
		</Layout>
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
