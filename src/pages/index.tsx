import * as React from 'react';
import { AggregatorContainer } from '~/components/Aggregator';
import Layout from '~/layout';
import { getSandwichList } from '~/props/getSandwichList';
import { getTokenList } from '~/props/getTokenList';
import { getTokensMaps } from '~/props/getTokensMaps';

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
	return (
		<Layout title={`Meta-dex aggregator - DefiLlama`} defaultSEO>
			<div style={{ display: 'flex', justifyContent: 'center' }}>
				<AggregatorContainer {...props} />
			</div>
		</Layout>
	);
}
