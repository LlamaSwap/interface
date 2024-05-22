import * as React from 'react';
import { AggregatorContainer } from '~/components/Aggregator';
import ConnectButton from '~/components/Aggregator/ConnectButton';
import Header from '~/components/Aggregator/Header';
import Tabs from '~/components/Aggregator/Tabs';
import Yields from '~/components/Aggregator/Yileds';
import Layout from '~/layout';
import { getSandwichList } from '~/props/getSandwichList';
import { getTokenList } from '~/props/getTokenList';
import { getTokensMaps } from '~/props/getTokensMaps';

export async function getStaticProps() {
	const tokenList = await getTokenList();
	const sandwichList = await getSandwichList();
	const { tokensSymbolsMap, tokensUrlMap } = getTokensMaps(tokenList);
	const yields = await fetch('https://yields.llama.fi/pools')
		.then((res) => res.json())
		.then((res) => res.data);

	return {
		props: {
			tokenList,
			sandwichList,
			tokensSymbolsMap,
			tokensUrlMap,
			yields
		}
	};
}

export default function Aggregator(props) {
	const tabData = [
		{ id: 'swap', name: 'Swap', content: <AggregatorContainer {...props} /> },
		{ id: 'yields', name: 'Yields', content: <Yields data={props.yields} /> },
		{ id: 'lending', name: 'Lending', content: <div></div> }
	];
	return (
		<Layout title={`Meta-dex aggregator - DefiLlama`} defaultSEO>
			<Header>
				<ConnectButton {...props} />
			</Header>
			<div style={{ display: 'flex', justifyContent: 'center' }}>
				<Tabs tabs={tabData} />
			</div>
		</Layout>
	);
}
