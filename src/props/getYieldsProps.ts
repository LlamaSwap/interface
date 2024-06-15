export async function getYieldsProps() {
	const yields = await fetch('https://yields.llama.fi/pools')
		.then((res) => res.json())
		.then((res) => res.data);
	const yieldsConfig = await fetch('https://api.llama.fi/config/yields')
		.then((res) => res.json())
		.then((c) => c.protocols);

	return {
		data: yields.map((pool) => {
			return { ...pool, config: yieldsConfig[pool.project] || {} };
		})
	};
}
