import * as React from 'react';
import { AggregatorContainer } from '~/components/Aggregator';
import Lending from '~/components/Lending';
import SmolRefuel from '~/components/SmolRefuel';
import Tabs from '~/components/Tabs';
import Yields from '~/components/Yields';
import Layout from '~/layout';

export default function Aggregator() {
	const tabData = [
		{ id: 'swap', name: 'Swap', content: <AggregatorContainer /> },
		{ id: 'earn', name: 'Earn', content: <Yields /> },
		{ id: 'borrow', name: 'Borrow', content: <Lending /> },
		{ id: 'refuel', name: 'Gas Refuel', content: <SmolRefuel /> }
	];
	return (
		<Layout title={`Meta-dex aggregator - DefiLlama`} defaultSEO>
			<Tabs tabs={tabData} />
		</Layout>
	);
}
