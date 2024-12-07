import { IPool } from '~/types';

export async function getLSDPageData(pools) {
	const [{ protocols }] = await Promise.all(
		['https://api.llama.fi/lite/protocols2?b=2'].map((url) => fetch(url).then((r) => r.json()))
	);

	// filter for LSDs
	const lsdProtocols = protocols
		.filter((p) => p.category === 'Liquid Staking' && p.chains.includes('Ethereum'))
		.map((p) => p.name)
		.filter((p) => !['StakeHound', 'Genius', 'SharedStake'].includes(p))
		.concat('Crypto.com Staked ETH');

	// get historical data
	const lsdProtocolsSlug = lsdProtocols.map((p) => p.replace(/\s+/g, '-').toLowerCase());

	let lsdApy = pools
		.filter((p) => lsdProtocolsSlug.includes(p.project) && p.chain === 'Ethereum' && p.symbol.includes('ETH'))
		.concat(pools.find((i) => i.project === 'crypto.com-staked-eth'))
		.map((p) => ({
			...p,
			name: p.project
				.split('-')
				.map((i) =>
					i === 'stakewise' ? 'StakeWise' : i === 'eth' ? i.toUpperCase() : i.charAt(0).toUpperCase() + i.slice(1)
				)
				.join(' ')
		}));

	return lsdApy;
}

async function getLendBorrowData(pools: Array<IPool> = []) {
	const yieldsConfig = await fetch('https://api.llama.fi/config/yields')
		.then((res) => res.json())
		.then((c) => c.protocols);

	const lsdData = await getLSDPageData(pools);
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
			if (x?.mintedCoin) tokenSymbols.add(x.mintedCoin);

			const apyBaseBorrow = x.apyBaseBorrow !== null ? -x.apyBaseBorrow : null;
			const apyRewardBorrow = x.apyRewardBorrow;
			const apyBorrow = apyBaseBorrow === null && apyRewardBorrow === null ? null : apyBaseBorrow + apyRewardBorrow;
			const isBorrowable = x.borrowable || x.totalBorrowUsd > 0;
			const lsdApy =
				lsdData.find((i) => p?.symbol?.toLowerCase().includes(i.symbol?.toLowerCase()) && !p.symbol?.includes('-'))
					?.apy || 0;
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
				apy: p.apy + lsdApy,
				lsdApy,
				apu: p.apy,
				apyBaseBorrow,
				apyRewardBorrow,
				totalSupplyUsd: x.totalSupplyUsd,
				totalBorrowUsd: x.totalBorrowUsd,
				ltv: x.ltv,
				borrowable: isBorrowable,
				mintedCoin: x.mintedCoin,
				borrowFactor: x.borrowFactor,
				totalAvailableUsd,
				apyBorrow,
				rewardTokens: (p.apyReward ?? 0) > 0 || x.apyRewardBorrow > 0 ? x.rewardTokens : p.rewardTokens
			};
		})
		.filter(Boolean)
		.sort((a, b) => b!.totalSupplyUsd - a!.totalSupplyUsd) as Array<IPool>;

	return {
		yields: pools,
		chainList: [...new Set(pools.map((p) => p.chain))],
		categoryList: categoriesToKeep,
		allPools: pools,
		lsdData,
		tokens: [...tokenSymbols].map((s) => ({ name: s, symbol: s }))
	};
}

export async function getLendingProps() {
	const yields = await fetch('https://yields.llama.fi/pools')
		.then((res) => res.json())
		.then((res) => res.data);
	const lendingData = await getLendBorrowData(yields);
	return lendingData;
}
