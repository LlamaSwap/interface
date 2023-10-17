import { useQueries, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { partial, first, omit } from 'lodash';

import { redirectQuoteReq } from '~/components/Aggregator/adapters/utils';
import { getOptimismFee } from '~/components/Aggregator/hooks/useOptimismFees';
import { adapters, adaptersWithApiKeys } from '~/components/Aggregator/list';

interface IGetListRoutesProps {
	chain: string;
	from?: string;
	to?: string;
	amount?: string;
	extra?: any;
	disabledAdapters?: Array<string>;
	customRefetchInterval?: number;
}

export interface IRoute {
	price: {
		amountReturned: any;
		estimatedGas: any;
		tokenApprovalAddress: any;
		logo: string;
		feeAmount?: number;
		rawQuote?: {};
	} | null;
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
}

interface IGetAdapterRouteProps extends IGetListRoutesProps {
	adapter: any;
}

export const REFETCH_INTERVAL = 25_000;

export async function getAdapterRoutes({ adapter, chain, from, to, amount, extra = {} }: IGetAdapterRouteProps) {
	if (!chain || !from || !to || (!amount && !extra.amountOut) || (amount === '0' && extra.amountOut === '0')) {
		return {
			price: null,
			name: adapter.name,
			airdrop: !adapter.token,
			fromAmount: amount,
			txData: '',
			l1Gas: 0,
			tx: {},
			isOutputAvailable: false
		};
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
			amountIn = price.amountIn;
		} else if (isOutputDefined && !adapter.isOutputAvailable) {
			return {
				price: null,
				name: adapter.name,
				airdrop: !adapter.token,
				fromAmount: amount,
				txData: '',
				l1Gas: 0,
				tx: {},
				isOutputAvailable: false
			};
		} else {
			price = await quouteFunc(chain, from, to, amount, extra);
		}

		if (!amountIn) throw Error('amountIn is not defined');

		const txData = adapter?.getTxData?.(price) ?? '';
		let l1Gas: number | 'Unknown' = 0;

		if (chain === 'optimism') {
			l1Gas = await getOptimismFee(txData);
		}

		const res = {
			price,
			l1Gas,
			txData,
			tx: adapter?.getTx?.(price),
			name: adapter.name,
			airdrop: !adapter.token,
			fromAmount: amountIn,
			isOutputAvailable: adapter.isOutputAvailable
		};

		return res;
	} catch (e) {
		console.error(e);
		return {
			price: null,
			l1Gas: 0,
			name: adapter.name,
			airdrop: !adapter.token,
			fromAmount: amount,
			txData: '',
			tx: {},
			isOutputAvailable: false
		};
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
	const res = useQueries({
		queries: adapters
			.filter((adap) => adap.chainToId[chain] !== undefined && !disabledAdapters.includes(adap.name))
			.map<UseQueryOptions<IRoute>>((adapter) => {
				return {
					queryKey: ['routes', adapter.name, chain, from, to, amount, JSON.stringify(omit(extra, 'amount'))],
					queryFn: () => getAdapterRoutes({ adapter, chain, from, to, amount, extra }),
					refetchInterval: customRefetchInterval || REFETCH_INTERVAL,
					refetchOnWindowFocus: false,
					refetchIntervalInBackground: false
				};
			})
	});
	const data = res?.filter((r) => r.status === 'success') ?? [];
	const resData = res?.filter((r) => r.status === 'success' && !!r.data && r.data.price) ?? [];
	const loadingRoutes =
		res
			?.map((r, i) => [adapters[i].name, r])
			?.filter((r: [string, UseQueryResult<IRoute>]) => r[1].status === 'loading') ?? [];

	return {
		isLoaded: loadingRoutes.length === 0,
		isLoading: data.length >= 1 ? false : true,
		data: resData?.map((r) => r.data) ?? [],
		refetch: () => res?.forEach((r) => r.refetch()),
		lastFetched:
			first(
				data
					.filter((d) => d.isSuccess && !d.isFetching && d.dataUpdatedAt > 0)
					.sort((a, b) => a.dataUpdatedAt - b.dataUpdatedAt)
					.map((d) => d.dataUpdatedAt)
			) || null,
		loadingRoutes
	};
}
