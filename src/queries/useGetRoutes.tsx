import { useQueries, UseQueryOptions } from '@tanstack/react-query';
import { useMemo } from 'react';
import { adapters } from '~/components/Aggregator/router';
import { providers } from '~/components/Aggregator/rpcs';

interface IGetListRoutesProps {
	chain: string;
	from?: string;
	to?: string;
	amount?: string;
	extra?: any;
}

interface IRoute {
	price: { amountReturned: any; estimatedGas: any; tokenApprovalAddress: any; logo: string } | null;
	name: string;
	airdrop: boolean;
	fromAmount: string;
	rawQuote?: {
		data: string;
		to: string;
		value: string;
	};
}

interface IGetAdapterRouteProps extends IGetListRoutesProps {
	adapter: any;
}

interface IEstimateGasQuery {
	name?: string;
	data?: string;
	to?: string;
	value?: string;
	chain: string;
}

async function estimateTxGas({ chain, data, to, value }: IEstimateGasQuery) {
	try {
		if (!data || !to || !value || !chain) {
			return null;
		}

		const estimatedGas = await providers[chain].estimateGas({
			to,
			data,
			value
		});

		return estimatedGas ? Number(estimatedGas.toString()) : null;
	} catch (error) {
		return null;
	}
}

async function getAdapterRoutes({ adapter, chain, from, to, amount, extra = {} }: IGetAdapterRouteProps) {
	if (!chain || !from || !to || !amount) {
		return { price: null, name: adapter.name, airdrop: !adapter.token, fromAmount: amount };
	}

	try {
		const { rawQuote, ...price } = await adapter.getQuote(chain, from, to, amount, {
			...extra
		});

		const res: IRoute = {
			price,
			name: adapter.name,
			airdrop: !adapter.token,
			fromAmount: amount,
			rawQuote
		};

		return res;
	} catch (e) {
		return {
			price: null,
			name: adapter.name,
			airdrop: !adapter.token,
			fromAmount: amount
		};
	}
}

export default function useGetRoutes({ chain, from, to, amount, extra = {} }: IGetListRoutesProps) {
	const routes = useQueries({
		queries: adapters
			.filter((adap) => adap.chainToId[chain] !== undefined)
			.map<UseQueryOptions<IRoute>>((adapter) => {
				return {
					queryKey: ['routes', adapter.name, chain, from, to, amount, JSON.stringify(extra)],
					queryFn: () => getAdapterRoutes({ adapter, chain, from, to, amount, extra }),
					refetchInterval: 20_000
				};
			})
	});

	const filteredRoutes = useMemo(
		() => routes?.filter((r) => r.status === 'success' && !!r.data && r.data.price).map((r) => r.data) ?? [],
		[routes]
	);

	const gasEstimatesByRoutes = useQueries({
		queries: filteredRoutes.map<UseQueryOptions<number | null>>((route) => {
			return {
				queryKey: ['gasEstimates', route.name, chain, route.rawQuote?.to, route.rawQuote?.value],
				queryFn: () => estimateTxGas({ chain, ...(route.rawQuote || {}) }),
				refetchInterval: 20_000
			};
		})
	});

	const data = useMemo(() => {
		if (!gasEstimatesByRoutes) {
			return filteredRoutes;
		}

		return filteredRoutes.map((route, index) => {
			const estimatedGas = gasEstimatesByRoutes[index].status === 'success' && gasEstimatesByRoutes[index].data;

			return { ...route, price: { ...route.price, estimatedGas: estimatedGas || route.price.estimatedGas } };
		});
	}, [filteredRoutes, gasEstimatesByRoutes]);

	return {
		isLoading: routes.filter((r) => r.status === 'success').length >= 1 ? false : true,
		data
	};
}
