import * as React from 'react';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { Flex, FormControl, FormLabel, Heading, IconButton } from '@chakra-ui/react';
import Layout from '~/layout';
import ReactSelect from '~/components/MultiSelect';
import { getAllChains } from '~/components/Aggregator/router';
import { LiquidityByToken } from '~/components/LiquidityByToken';
import { ArrowRight } from 'react-feather';
import { useSelectedChainAndTokens } from '~/hooks/useSelectedChainAndTokens';
import { TokenSelect } from '~/components/InputAmountAndTokenSelect/TokenSelect';
import styled from 'styled-components';

const chains = getAllChains();

export default function TokenLiquidity() {
	const router = useRouter();

	const { finalSelectedFromToken, finalSelectedToToken, selectedChain } = useSelectedChainAndTokens();

	const onChainChange = useCallback((chain) => {
		router.push({ pathname: router.pathname, query: { ...router.query, chain: chain.value } }, undefined, {
			shallow: true
		});
	}, [router]);

	const onFromTokenChange = useCallback((token) => {
		router.push({ pathname: router.pathname, query: { ...router.query, from: token.address } }, undefined, {
			shallow: true
		});
	}, [router]);

	const onToTokenChange = useCallback((token) => {
		router.push({ pathname: router.pathname, query: { ...router.query, to: token.address } }, undefined, {
			shallow: true
		});
	}, [router]);

	return (
		<Layout title={`Token Liquidity - LlamaSwap`} defaultSEO>
			<Heading alignSelf="center">Token Liquidity</Heading>

			<Flex flexDir="column" gap="20px" marginTop="40px" maxW="48rem" w="100%" marginX="auto">
				<FormControl display="flex" flexDirection="column" justifyContent={'center'}>
					<FormLabel htmlFor="privacy-switch" pb="0" lineHeight={1}>
						Chain
					</FormLabel>
					<ReactSelect options={chains} value={selectedChain} onChange={onChainChange} style={{ flex: 1 }} />
				</FormControl>

				<Flex gap="16px" alignItems="center">
					<FormControl display="flex" flexDirection="column" justifyContent={'center'}>
						<FormLabel htmlFor="privacy-switch" pb="0" lineHeight={1}>
							From
						</FormLabel>
						<SelectWrapper>
							<TokenSelect onClick={onFromTokenChange} type="amountIn" />
						</SelectWrapper>
					</FormControl>
					<IconButton
						onClick={() =>
							router.push(
								{
									pathname: router.pathname,
									query: { ...router.query, to: finalSelectedFromToken?.address, from: finalSelectedToToken?.address }
								},
								undefined,
								{ shallow: true }
							)
						}
						bg="none"
						icon={<ArrowRight />}
						aria-label="Switch Tokens"
						marginTop="auto"
					/>

					<FormControl display="flex" flexDirection="column" justifyContent={'center'}>
						<FormLabel htmlFor="privacy-switch" pb="0" lineHeight={1}>
							To
						</FormLabel>
						<SelectWrapper>
							<TokenSelect onClick={onToTokenChange} type="amountOut" />
						</SelectWrapper>
					</FormControl>
				</Flex>
			</Flex>

			{selectedChain && finalSelectedFromToken && finalSelectedToToken && (
				<LiquidityByToken
					fromToken={finalSelectedFromToken}
					toToken={finalSelectedToToken}
					chain={selectedChain.value}
				/>
			)}
		</Layout>
	);
}

const SelectWrapper = styled.span`
	width: 100%;
	& > *:first-child {
		width: 100%;
		max-width: 100%;
		box-shadow:
			0px 24px 32px rgba(0, 0, 0, 0.04),
			0px 16px 24px rgba(0, 0, 0, 0.04),
			0px 4px 8px rgba(0, 0, 0, 0.04),
			0px 0px 1px rgba(0, 0, 0, 0.04);
		border-radius: 12px;
		background: ${({ theme }) => theme.bg6};
	}
`;
