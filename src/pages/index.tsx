import * as React from 'react';
import { AggregatorContainer } from '~/components/Aggregator';
import Lending from '~/components/Lending';
import Tabs from '~/components/Tabs';
import Yields from '~/components/Yields';
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
	const tabData = [
		{ id: 'swap', name: 'Swap', content: <AggregatorContainer {...props} /> },
		{ id: 'earn', name: 'Earn', content: <Yields tokens={props?.tokenList} /> },
		{ id: 'borrow', name: 'Borrow', content: <Lending /> }
	];
	return (
		<Layout title={`Meta-dex aggregator - DefiLlama`} defaultSEO>
			<div style={{ display: 'flex', justifyContent: 'center' }}>
				<Tabs tabs={tabData} />
			</div>
		</Layout>
	);
}
