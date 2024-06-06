import * as React from 'react';
// import { AggregatorContainer } from '~/components/Aggregator';
import ConnectButton from '~/components/Aggregator/ConnectButton';
import Header from '~/components/Aggregator/Header';
import Layout from '~/layout';
import { getSandwichList } from '~/props/getSandwichList';
import { getTokenList } from '~/props/getTokenList';
import { getTokensMaps } from '~/props/getTokensMaps';
import { useToken } from '~/queries/useToken';

export async function getStaticProps() {
	const tokenList = await getTokenList();
	const sandwichList = await getSandwichList();
	const { tokensSymbolsMap, tokensUrlMap } = getTokensMaps(tokenList);
	return {
		props: {
			tokenList,
			sandwichList,
			tokensSymbolsMap,
			tokensUrlMap
		}
	};
}

export default function Aggregator(props) {
	const r = useToken({ address: '0x1dfe7ca09e99d10835bf73044a23b73fc20623df', chainId: 1 });
	return (
		<Layout title={`Meta-dex aggregator - DefiLlama`} defaultSEO>
			<Header>
				<ConnectButton {...props} />
			</Header>
			{/*<AggregatorContainer {...props} /> */}
		</Layout>
	);
}
