import * as React from 'react';
import { useRouter } from 'next/router';
import { Flex, FormControl, FormLabel, Heading } from '@chakra-ui/react';
import Layout from '~/layout';
import { getTokenList } from '~/components/Aggregator/getTokenList';
import { chainsMap, topTokens } from '~/components/Aggregator/constants';
import ReactSelect from '~/components/MultiSelect';
import { getAllChains } from '~/components/Aggregator/router';
import { LiquidityByToken } from '~/components/LiquidityByToken';
import type { IToken } from '~/types';

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
		const chainTokenList: Array<IToken> = tokenlist && chainName ? tokenlist[chainsMap[chainName]] || [] : null;
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

			<Flex flexDir="column" gap="44px" marginY={4} overflowX="auto">
				{topTokensOfChain.length > 0 &&
					topTokensOfChain.map((token) => (
						<LiquidityByToken
							key={token.address + selectedToken.address}
							fromToken={selectedToken}
							toToken={token}
							chain={chainName}
						/>
					))}
			</Flex>
		</Layout>
	);
}
