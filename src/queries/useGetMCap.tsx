import { useQuery } from '@tanstack/react-query';

interface IGetMcap {
	id: string | null;
}

export async function getMcap({ id }: IGetMcap) {
	try {
		if (!id) {
			return null;
		}

		const data =
			await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_market_cap=true
		`).then((res) => res.json());

		return data ? Object.values(data)?.[0]?.['usd_market_cap'] ?? null : null;
	} catch (error) {
		console.log(`Failed to  fetch mcap of ${id}`, error);
	}
}

export function useGetMcap({ id }: IGetMcap) {
	return useQuery({
		queryKey: ['mcap', id],
		queryFn: () => getMcap({ id }),
		staleTime: 5 * 60 * 1000
	});
}
