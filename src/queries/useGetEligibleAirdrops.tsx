import { useQuery } from '@tanstack/react-query';

export function useGetEligibleAirdrops({ address }: { address?: string }) {
	return useQuery({
		queryKey: ['eligible-airdrops', address],
		queryFn: address
			? () =>
					fetch(`https://airdrops.llama.fi/check/${address.toLowerCase()}`)
						.then((res) => res.json())
						.then((res) => res[address.toLowerCase()]?.odos1 ?? null)
						.catch(() => null)
			: () => null
	});
}
