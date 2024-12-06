import { useQueries, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { partial, omit } from 'lodash';
import { useMemo } from 'react';

import { redirectQuoteReq } from '~/components/Aggregator/adapters/utils';
import { chainsWithOpFees, getOptimismFee } from '~/components/Aggregator/utils/optimismFees';
import { adapters, adaptersWithApiKeys } from '~/components/Aggregator/list';

interface IGetListRoutesProps {
	chain?: string;
	from?: string;
	to?: string;
	amount?: string;
	extra?: any;
	disabledAdapters?: Array<string>;
	customRefetchInterval?: number;
}

interface IPrice {
	amountReturned: any;
	estimatedGas: any;
	tokenApprovalAddress: any;
	logo: string;
	isGaslessApproval?: boolean;
	feeAmount?: number;
	rawQuote?: {};
}

interface IAdapterRoute {
	price: IPrice | null;
	name: string;
	airdrop: boolean;
	fromAmount: string;
	txData: string;
	l1Gas: number | 'Unknown';
	tx: {
		from: string;
		to: string;
		data: string;
	};
	isOutputAvailable: boolean;
	isGasless: boolean;
}

export interface IRoute extends Omit<IAdapterRoute, 'price'> {
	price: IPrice;
}

interface IGetAdapterRouteProps extends IGetListRoutesProps {
	adapter: any;
}

export const REFETCH_INTERVAL = 25_000;

const defaultRouteResponse = ({ adapter, amount }) => ({
	price: null,
	name: adapter.name,
	airdrop: !adapter.token,
	fromAmount: amount,
	txData: '',
	l1Gas: 0,
	tx: {},
	isOutputAvailable: false,
	isGasless: adapter.isGasless ?? false
});

export async function getAdapterRoutes({ adapter, chain, from, to, amount, extra = {} }: IGetAdapterRouteProps) {
	if (!chain || !from || !to || (!amount && !extra.amountOut) || (amount === '0' && extra.amountOut === '0')) {
		return defaultRouteResponse({ adapter, amount });
	}

	try {
		const isOutputDefined = extra.amountOut && extra.amountOut !== '0';
		let price;
		let amountIn = amount;

		const quouteFunc =
			extra.isPrivacyEnabled || adaptersWithApiKeys[adapter.name]
				? partial(redirectQuoteReq, adapter.name)
				: adapter.getQuote;
		if (adapter.isOutputAvailable) {
			price = await quouteFunc(chain, from, to, amount, extra);
			if (price) {
				amountIn = price.amountIn;
			}
		} else if (isOutputDefined && !adapter.isOutputAvailable) {
			return defaultRouteResponse({ adapter, amount });
		} else {
			price = await quouteFunc(chain, from, to, amount, extra);
		}

		if (!price) {
			return defaultRouteResponse({ adapter, amount });
		}

		if (!amountIn) throw Error('amountIn is not defined');

		const txData = adapter?.getTxData?.(price) ?? '';
		let l1Gas: number | 'Unknown' = 0;

		if (txData !== '' && chainsWithOpFees.includes(chain) && adapter.isGasless !== true) {
			l1Gas = await getOptimismFee(txData, chain);
		}

		const res = {
			price,
			l1Gas,
			txData,
			tx: adapter?.getTx?.(price),
			name: adapter.name,
			airdrop: !adapter.token,
			fromAmount: amountIn,
			isOutputAvailable: adapter.isOutputAvailable,
			isGasless: adapter.isGasless ?? false
		};

		return res;
	} catch (e) {
		console.error(`Error fetching ${adapter.name} quote`);
		console.error(e);
		return defaultRouteResponse({ adapter, amount });
	}
}

export function useGetRoutes({
	chain,
	from,
	to,
	amount,
	extra = {},
	disabledAdapters = [],
	customRefetchInterval
}: IGetListRoutesProps) {
	const chainAdapters = useMemo(() => {
		return adapters.filter((adap) =>
			chain && adap.chainToId[chain] !== undefined && !disabledAdapters.includes(adap.name) ? true : false
		);
	}, [chain, disabledAdapters]);

	const res = useQueries({
		// @ts-ignore
		queries: chainAdapters.map<UseQueryOptions<IAdapterRoute>>((adapter) => {
			return {
				queryKey: [
					'routes',
					adapter.name,
					chain,
					from,
					to,
					amount,
					JSON.stringify(omit(extra, 'amount', 'gasPriceData'))
				],
				queryFn: () => getAdapterRoutes({ adapter, chain, from, to, amount, extra }),
				staleTime: customRefetchInterval || REFETCH_INTERVAL,
				refetchInterval: customRefetchInterval || REFETCH_INTERVAL
			};
		})
	});

	const { lastFetched, loadingRoutes, data, isLoading } = useMemo(() => {
		const loadingRoutes =
			res
				?.map((r, i) => [chainAdapters[i].name, r] as [string, UseQueryResult<IAdapterRoute>])
				?.filter((r) => r[1].isLoading) ?? [];

		const data =
			res?.filter((r) => r.status === 'success' && !!r.data && r.data.price).map((r) => r.data as IRoute) ?? [];

		return {
			lastFetched:
				res
					.filter((d) => d.isSuccess && !d.isFetching && d.dataUpdatedAt > 0)
					.sort((a, b) => a.dataUpdatedAt - b.dataUpdatedAt)?.[0]?.dataUpdatedAt ?? Date.now(),
			loadingRoutes,
			data,
			isLoading: res.length > 0 && data.length === 0
		};
	}, [res, chainAdapters]);

	return {
		isLoading,
		data,
		refetch: () => res?.forEach((r) => r.refetch()),
		lastFetched,
		loadingRoutes
	};
}
