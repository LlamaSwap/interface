import * as React from 'react';
import { useRouter } from 'next/router';
import Layout from '~/layout';
import { getTokenList } from '~/components/Aggregator';
import { chainsMap } from '~/components/Aggregator/constants';
import { useGetTokenLiquidity } from '~/queries/useGetTokenLiquidity';
import type { IToken } from '~/types';

export async function getStaticProps() {
	return getTokenList();
}

export default function TokenLiquidity({ tokenlist }) {
	const router = useRouter();

	const { chain, token } = router.query;

	const chainName = typeof chain === 'string' ? chain.toLowerCase() : null;

	const fromTokenSymbol = typeof token === 'string' ? token.toLowerCase() : null;

	const chainTokenList: Array<IToken> = tokenlist && chainName ? tokenlist[chainsMap[chainName]] : null;

	const { data } = useGetTokenLiquidity({ chain: chainName, token: fromTokenSymbol, tokenList: chainTokenList });

	return (
		<Layout title={`Token Liquidity - LlamaSwap`} defaultSEO>
			<></>
		</Layout>
	);
}
