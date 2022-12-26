import * as React from 'react';
import { useRouter } from 'next/router';
import { Flex, FormControl, FormLabel, Heading, IconButton } from '@chakra-ui/react';
import Layout from '~/layout';
import { getTokenList } from '~/components/Aggregator/getTokenList';
import { chainsMap } from '~/components/Aggregator/constants';
import ReactSelect from '~/components/MultiSelect';
import { getAllChains } from '~/components/Aggregator/router';
import { LiquidityByToken } from '~/components/LiquidityByToken';
import type { IToken } from '~/types';
import { ArrowRight } from 'react-feather';

export async function getStaticProps() {
	return getTokenList();
}

const chains = getAllChains();

export default function TokenLiquidity({ tokenlist }) {
	const router = useRouter();

	const { chain, from: fromToken, to: toToken } = router.query;

	const chainName = typeof chain === 'string' ? chain.toLowerCase() : 'ethereum';
	const fromTokenSymbol = typeof fromToken === 'string' ? fromToken.toLowerCase() : null;
	const toTokenSymbol = typeof toToken === 'string' ? toToken.toLowerCase() : null;

	const { selectedChain, selectedFromToken, selectedToToken, chainTokenList } = React.useMemo(() => {
		const tokenList: Array<IToken> = tokenlist && chainName ? tokenlist[chainsMap[chainName]] || [] : null;

		const selectedChain = chains.find((c) => c.value === chainName);

		const selectedFromToken = tokenList?.find(
			(t) => t.symbol.toLowerCase() === fromTokenSymbol || t.address.toLowerCase() === fromTokenSymbol
		);

		const selectedToToken = tokenList?.find(
			(t) => t.symbol.toLowerCase() === toTokenSymbol || t.address.toLowerCase() === toTokenSymbol
		);

		return {
			selectedChain,
			selectedFromToken: selectedFromToken
				? { ...selectedFromToken, label: selectedFromToken.symbol, value: selectedFromToken.address }
				: null,
			selectedToToken: selectedToToken
				? { ...selectedToToken, label: selectedToToken.symbol, value: selectedToToken.address }
				: null,
			chainTokenList: tokenList
		};
	}, [chainName, fromTokenSymbol, toTokenSymbol, tokenlist]);

	const onChainChange = (chain) => {
		router.push({ pathname: router.pathname, query: { ...router.query, chain: chain.value } }, undefined, {
			shallow: true
		});
	};

	const onFromTokenChange = (token) => {
		router.push({ pathname: router.pathname, query: { ...router.query, from: token.symbol } }, undefined, {
			shallow: true
		});
	};

	const onToTokenChange = (token) => {
		router.push({ pathname: router.pathname, query: { ...router.query, to: token.symbol } }, undefined, {
			shallow: true
		});
	};

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
						<ReactSelect
							options={chainTokenList}
							value={selectedFromToken}
							onChange={onFromTokenChange}
							style={{ flex: 1 }}
						/>
					</FormControl>
					<IconButton
						onClick={() =>
							router.push(
								{
									pathname: router.pathname,
									query: { ...router.query, to: fromToken, from: toToken }
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
						<ReactSelect
							options={chainTokenList}
							value={selectedToToken}
							onChange={onToTokenChange}
							style={{ flex: 1 }}
						/>
					</FormControl>
				</Flex>
			</Flex>

			{selectedChain && selectedFromToken && selectedToToken && (
				<LiquidityByToken fromToken={selectedFromToken} toToken={selectedToToken} chain={chainName} />
			)}
		</Layout>
	);
}
