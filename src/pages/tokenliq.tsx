import { useQuery } from '@tanstack/react-query';
import * as React from 'react';
import Layout from '~/layout';

async function getTokenLiq() {
	const data = await fetch(
		'https://llamaswap-git-cors-llamapay.vercel.app/api/token-liquidity?token=wbtc&chain=ethereum'
	).then((res) => res.json());

	return data;
}

async function getTokenLiq1() {
	const data = await fetch('/api/token-liquidity?token=wbtc&chain=ethereum').then((res) => res.json());

	return data;
}

export default function Aggregator() {
	const { data } = useQuery(['liq1'], getTokenLiq);

	const { data: data1 } = useQuery(['liq2'], getTokenLiq1);

	console.log({ data, data1 });

	return (
		<Layout title={`Meta-dex aggregator - DefiLlama`} defaultSEO>
			<></>
		</Layout>
	);
}
