import * as React from 'react';
import { AggregatorContainer } from '~/components/Aggregator';
import ConnectButton from '~/components/Aggregator/ConnectButton';
import Layout from '~/layout';
import { getSandwichList } from '~/props/getSandwichList';
import { getTokenList } from '~/props/getTokenList';

export async function getStaticProps() {
	const tokenList = await getTokenList();
	const sandwichList = await getSandwichList();
	return {
		props: {
			tokenList,
			sandwichList
		}
	};
}

export default function Aggregator(props) {
	return (
		<Layout title={`Meta-dex aggregator - DefiLlama`} defaultSEO>
			<ConnectButton />
			<AggregatorContainer {...props} />
		</Layout>
	);
}
