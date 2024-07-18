import { Suspense, lazy } from 'react';
import Loader from '~/components/Aggregator/Loader';
import Tabs from '~/components/Tabs';
import Layout from '~/layout';
import { getSandwichList } from '~/props/getSandwichList';
import { getTokenList } from '~/props/getTokenList';
import { getTokensMaps } from '~/props/getTokensMaps';
import { useLendingProps } from '~/queries/useLendingProps';
import { useYieldProps } from '~/queries/useYieldProps';
import { AggregatorContainer } from '~/components/Aggregator';

const Lending = lazy(() => import('~/components/Lending'));
const Yields = lazy(() => import('~/components/Yields'));

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
	const yieldProps = useYieldProps();
	const lendingProps = useLendingProps();
	const tabData = [
		{
			id: 'swap',
			name: 'Swap',
			content: () => <AggregatorContainer {...props} />
		},
		{
			id: 'earn',
			name: 'Earn',
			content: () => (
				<Suspense fallback={<Loader />}>
					<Yields tokens={props?.tokenList} {...yieldProps} />
				</Suspense>
			)
		},
		{
			id: 'borrow',
			name: 'Borrow',
			content: () => (
				<Suspense fallback={<Loader />}>
					<Lending {...lendingProps} />
				</Suspense>
			)
		}
	];
	return (
		<Layout title={`Meta-dex aggregator - DefiLlama`} defaultSEO>
			<div style={{ display: 'flex', justifyContent: 'center' }}>
				<Tabs tabs={tabData} />
			</div>
		</Layout>
	);
}
