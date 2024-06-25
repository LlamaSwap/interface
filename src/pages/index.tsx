import * as React from 'react';
import { AggregatorContainer } from '~/components/Aggregator';
import Lending from '~/components/Lending';
import Tabs from '~/components/Tabs';
import Yields from '~/components/Yields';
import Layout from '~/layout';
import { getLendingProps } from '~/props/getLendingProps';
import { getSandwichList } from '~/props/getSandwichList';
import { getTokenList } from '~/props/getTokenList';
import { getTokensMaps } from '~/props/getTokensMaps';
import { getYieldsProps } from '~/props/getYieldsProps';

export async function getStaticProps() {
	const tokenList = await getTokenList();
	const sandwichList = await getSandwichList();
	const { tokensSymbolsMap, tokensUrlMap } = getTokensMaps(tokenList);
	const lendingProps = await getLendingProps();
	const yieldsProps = await getYieldsProps();

	return {
		props: {
			swapProps: {
				tokenList,
				sandwichList,
				tokensSymbolsMap,
				tokensUrlMap
			},
			lendingProps,
			yieldsProps
		}
	};
}

export default function Aggregator(props) {
	const tabData = [
		{ id: 'swap', name: 'Swap', content: <AggregatorContainer {...props?.swapProps} /> },
		{ id: 'earn', name: 'Earn', content: <Yields {...props.yieldsProps} tokens={props.swapProps?.tokenList} /> },
		{ id: 'borrow', name: 'Borrow', content: <Lending {...props?.lendingProps} /> }
	];
	return (
		<Layout title={`Meta-dex aggregator - DefiLlama`} defaultSEO>
			<div style={{ display: 'flex', justifyContent: 'center' }}>
				<Tabs tabs={tabData} />
			</div>
		</Layout>
	);
}
