import * as React from 'react';
import { useBlockNumber } from 'wagmi';
import { AggregatorContainer } from '~/components/Aggregator';
import ConnectButton from '~/components/Aggregator/ConnectButton';
import { getTokenList } from '~/components/Aggregator/getTokenList';
import Layout from '~/layout';

export async function getStaticProps() {
	return getTokenList();
}

export default function Aggregator(props) {
	const { data } = useBlockNumber();

	return (
		<Layout title={`Meta-dex aggregator - DefiLlama`} defaultSEO>
			<ConnectButton key={data} />
			<AggregatorContainer tokenlist={props.tokenlist} />
		</Layout>
	);
}
