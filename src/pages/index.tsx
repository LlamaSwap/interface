import * as React from 'react';
import { AggregatorContainer } from '~/components/Aggregator';
import Lending from '~/components/Lending';
import Tabs from '~/components/Tabs';
import Yields from '~/components/Yields';
import Layout from '~/layout';
import { getSandwichList } from '~/props/getSandwichList';
import { getTokenList } from '~/props/getTokenList';
import { getTokensMaps } from '~/props/getTokensMaps';
import { useLendingProps } from '~/queries/useLendingProps';
import { useYieldProps } from '~/queries/useYieldProps';

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
	const yeildProps = useYieldProps();
	const lendingProps = useLendingProps();
	const tabData = [
		{ id: 'swap', name: 'Swap', content: <AggregatorContainer {...props} /> },
		{ id: 'earn', name: 'Earn', content: <Yields tokens={props?.tokenList} {...yeildProps} /> },
		{ id: 'borrow', name: 'Borrow', content: <Lending {...lendingProps} /> }
	];
	return (
		<Layout title={`Meta-dex aggregator - DefiLlama`} defaultSEO>
			<div style={{ display: 'flex', justifyContent: 'center' }}>
				<Tabs tabs={tabData} />
			</div>
		</Layout>
	);
}
