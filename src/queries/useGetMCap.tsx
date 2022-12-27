import { useQuery } from '@tanstack/react-query';

interface IGetMcap {
	id: string;
}

export async function getMcap({ id }: IGetMcap) {
	if (!id) {
		return null;
	}

	const data =
		await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_market_cap=true
    `).then((res) => res.json());

	return data ? Object.values(data)?.[0]['usd_market_cap'] ?? null : null;
}

export function useGetMcap({ id }: IGetMcap) {
	return useQuery(['mcap', id], () => getMcap({ id }), {
		refetchOnMount: false,
		refetchInterval: 5 * 60 * 1000, // 5 minutes
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		refetchIntervalInBackground: false
	});
}
