import { BigNumber } from 'ethers';

export const tokens = {
	optimism: {
		weth: '0x4200000000000000000000000000000000000006',
		usdc: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
		op: '0x4200000000000000000000000000000000000042',
		snx: '0x8700dAec35aF8Ff88c16BdF0418774CB3D7599B4',
		dai: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
		susd: '0x8c6f28f2F1A3C87F0f938b96d27520d9751ec8d9',
		wbtc: '0x68f180fcCe6836688e9084f035309E29Bf0A2095',
		thales: '0x217D47011b23BB961eB6D93cA9945B7501a5BB11',
		usdt: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
		perp: '0x9e1028F5F1D5eDE59748FFceE5532509976840E0',
		velo: '0x3c8B650257cFb5f272f799F5e2b4e65093a11a05'
	},
	arbitrum: {
		weth: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
		usdc: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
		usdt: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
		gmx: '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a',
		dai: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
		wbtc: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
		gns: '0x18c11FD286C5EC11c3b683Caa813B77f5163A122',
		magic: '0x539bdE0d7Dbd336b79148AA742883198BBF60342',
		arb: '0x912CE59144191C1204E64559FE8253a0e49E6548'
	}
};

export const normalizeTokens = (t0, t1) =>
	BigNumber.from(t0).lt(t1) ? [t0.toLowerCase(), t1.toLowerCase()] : [t1.toLowerCase(), t0.toLowerCase()];

const createPair = (t0: string, t1: string, fee: string, pairId: string, mayFail: boolean = false) => {
	const [token0, token1] = normalizeTokens(t0, t1);

	return {
		name: `${token0}-${token1}`,
		pairId,
		token0,
		token1,
		fee,
		mayFail
	};
};

export const pairs = {
	optimism: (() => {
		const chainTokens = tokens.optimism;
		return [
			createPair(chainTokens.weth, chainTokens.usdc, '500', '0'),
			createPair(chainTokens.weth, chainTokens.op, '3000', '1'),
			createPair(chainTokens.op, chainTokens.usdc, '3000', '2'),
			createPair(chainTokens.weth, chainTokens.op, '500', '3'),
			createPair(chainTokens.usdc, chainTokens.dai, '100', '4'),
			createPair(chainTokens.snx, chainTokens.weth, '3000', '5'),
			createPair(chainTokens.weth, chainTokens.dai, '3000', '6')
		];
	})(),
	arbitrum: (() => {
		const chainTokens = tokens.arbitrum;

		return [
			createPair(chainTokens.weth, chainTokens.usdc, '500', '0'),
			createPair(chainTokens.weth, chainTokens.usdt, '500', '1'),
			createPair(chainTokens.weth, chainTokens.wbtc, '500', '2'),
			createPair(chainTokens.weth, chainTokens.gmx, '3000', '3'),
			createPair(chainTokens.weth, chainTokens.gns, '3000', '4'),
			createPair(chainTokens.weth, chainTokens.magic, '10000', '5'),
			createPair(chainTokens.weth, chainTokens.dai, '3000', '6'),
			createPair(chainTokens.weth, chainTokens.arb, '10000', '7'),
			createPair(chainTokens.weth, chainTokens.arb, '3000', '8', true),
			createPair(chainTokens.weth, chainTokens.arb, '500', '9', true),
			createPair(chainTokens.weth, chainTokens.arb, '100', '10', true)
		];
	})()
};
