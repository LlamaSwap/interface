import * as React from 'react';

import Yields from '~/components/Yields';
import Layout from '~/layout';

export async function getStaticProps() {
	const yields = await fetch('https://yields.llama.fi/pools')
		.then((res) => res.json())
		.then((res) => res.data);
	const yieldsConfig = await fetch('https://api.llama.fi/config/yields')
		.then((res) => res.json())
		.then((c) => c.protocols);

	return {
		props: {
			yields: yields.map((pool) => {
				return { ...pool, config: yieldsConfig[pool.project] || {} };
			}),
			yieldsConfig
		}
	};
}

export default function YieldsPage(props) {
	return (
		<Layout title={`Meta-dex aggregator - DefiLlama`} defaultSEO>
			<div style={{ display: 'flex', justifyContent: 'center' }}>
				<Yields data={props.yields} />
			</div>
		</Layout>
	);
}
