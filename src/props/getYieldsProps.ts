export async function getYieldsProps() {
	const yields = await fetch('https://yields.llama.fi/pools')
		.then((res) => res.json())
		.then((res) => res.data)
		.then((pools) => pools.filter((pool) => pool?.ilRisk === 'no'));
	const yieldsConfig = await fetch('https://api.llama.fi/config/yields')
		.then((res) => res.json())
		.then((c) => c.protocols);

	return {
		data: yields,
		config: yieldsConfig
	};
}
