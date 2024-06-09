import * as React from 'react';
import Lending from '~/components/Lending';
import Layout from '~/layout';

export async function getLendBorrowData(pools) {
	const yieldsConfig = await fetch('https://api.llama.fi/config/yields')
		.then((res) => res.json())
		.then((c) => c.protocols);

	pools.forEach((pool) => {
		pool.config = yieldsConfig[pool.project];
		pool.category = pool?.config?.category || '';
	});

	pools = pools.map((p) => ({
		...p,
		category: p.project === 'fraxlend' ? 'CDP' : p.category,
		apyBase: p.project === 'fraxlend' ? null : p.apyBase
	}));

	const categoriesToKeep = ['Lending', 'Undercollateralized Lending', 'CDP', 'NFT Lending'];
	pools = pools.filter((p) => categoriesToKeep.includes(p.category));

	let dataBorrow = await fetch('https://yields.llama.fi/lendBorrow').then((res) => res.json());
	dataBorrow = dataBorrow.filter((p) => p.ltv <= 1);

	const configIdsCompound = pools.filter((p) => p.project === 'compound').map((p) => p.pool);
	const configIdsAave = pools
		.filter((p) => p.project === 'aave-v2' && p.chain === 'Ethereum' && !p.symbol.toLowerCase().includes('amm'))
		.map((p) => p.pool);
	const compoundPools = dataBorrow.filter((p) => configIdsCompound.includes(p.pool));
	const aavev2Pools = dataBorrow.filter((p) => configIdsAave.includes(p.pool));

	const tokenSymbols = new Set<string>();
	const cdpPools = [...new Set(pools.filter((p) => p.category === 'CDP').map((p) => p.pool))];
	pools = pools
		.map((p) => {
			const x = dataBorrow.find((i) => i.pool === p.pool);
			if (x === undefined) return null;

			tokenSymbols.add(p.symbol);

			const apyBaseBorrow = x.apyBaseBorrow !== null ? -x.apyBaseBorrow : null;
			const apyRewardBorrow = x.apyRewardBorrow;
			const apyBorrow = apyBaseBorrow === null && apyRewardBorrow === null ? null : apyBaseBorrow + apyRewardBorrow;

			let totalAvailableUsd;
			if (p.project === 'morpho-compound') {
				const compoundData = compoundPools.find(
					(a) => a.underlyingTokens[0].toLowerCase() === x.underlyingTokens[0].toLowerCase()
				);
				totalAvailableUsd = compoundData?.totalSupplyUsd - compoundData?.totalBorrowUsd;
			} else if (p.project === 'morpho-aave') {
				const aaveData = aavev2Pools.find(
					(a) => a.underlyingTokens[0].toLowerCase() === x.underlyingTokens[0].toLowerCase()
				);
				totalAvailableUsd = aaveData?.totalSupplyUsd - aaveData?.totalBorrowUsd;
			} else if (x.totalSupplyUsd === null && x.totalBorrowUsd === null) {
				totalAvailableUsd = null;
			} else if (cdpPools.includes(x.pool)) {
				totalAvailableUsd = x.debtCeilingUsd ? x.debtCeilingUsd - x.totalBorrowUsd : null;
			} else if (p.project === 'compound' && x.debtCeilingUsd > 0) {
				totalAvailableUsd =
					x.totalSupplyUsd - x.totalBorrowUsd > x.debtCeilingUsd
						? x.debtCeilingUsd
						: x.totalSupplyUsd - x.totalBorrowUsd;
			} else {
				totalAvailableUsd = x.totalSupplyUsd - x.totalBorrowUsd;
			}

			return {
				...p,
				apyBaseBorrow,
				apyRewardBorrow,
				totalSupplyUsd: x.totalSupplyUsd,
				totalBorrowUsd: x.totalBorrowUsd,
				ltv: x.ltv,
				borrowable: x.borrowable,
				mintedCoin: x.mintedCoin,
				borrowFactor: x.borrowFactor,

				totalAvailableUsd,
				apyBorrow,
				rewardTokens: p.apyRewards > 0 || x.apyRewardBorrow > 0 ? x.rewardTokens : p.rewardTokens
			};
		})
		.filter(Boolean)
		.sort((a, b) => b.totalSupplyUsd - a.totalSupplyUsd);

	return {
		yields: pools,
		chainList: [...new Set(pools.map((p) => p.chain))],
		categoryList: categoriesToKeep,
		allPools: pools,
		symbols: [...tokenSymbols]
	};
}

export async function getStaticProps() {
	const tokensData = {};

	const yields = await fetch('https://yields.llama.fi/pools')
		.then((res) => res.json())
		.then((res) => res.data);
	const cgList = await fetch('https://defillama-datasets.llama.fi/tokenlist/sorted.json').then((res) => res.json());
	const cgTokens = cgList.filter((x) => x.symbol);
	const cgPositions = cgList.reduce((acc, e, i) => ({ ...acc, [e.symbol]: i }), {} as any);
	const lendingData = await getLendBorrowData(yields);

	lendingData.symbols
		.sort((a, b) => cgPositions[a] - cgPositions[b])
		.forEach((sRaw) => {
			const s = sRaw.replaceAll(/\(.*\)/g, '').trim();

			const cgToken = cgTokens.find((x) => x.symbol === sRaw.toLowerCase() || x.symbol === s.toLowerCase());

			tokensData[s] = {
				name: cgToken?.name ?? s,
				symbol: s,
				image: cgToken?.image ?? '',
				image2: cgToken?.image ?? ''
			};
		});

	return {
		props: {
			...lendingData,
			tokensData
		}
	};
}

export default function YieldsPage(props) {
	return (
		<Layout title={`Meta-dex aggregator - DefiLlama`} defaultSEO>
			<div style={{ display: 'flex', justifyContent: 'center' }}>
				<Lending {...props} />
			</div>
		</Layout>
	);
}
