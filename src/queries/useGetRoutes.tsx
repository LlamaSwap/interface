import { useQueries, UseQueryOptions } from '@tanstack/react-query';
import { omit } from 'lodash';
import { name as matcha0xName } from '~/components/Aggregator/adapters/0x';
import { redirectQuoteReq } from '~/components/Aggregator/adapters/utils';
import { getOptimismFee } from '~/components/Aggregator/hooks/useOptimismFees';
import { adapters } from '~/components/Aggregator/router';

interface IGetListRoutesProps {
	chain: string;
	from?: string;
	to?: string;
	amount?: string;
	extra?: any;
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
}

interface IGetAdapterRouteProps extends IGetListRoutesProps {
	adapter: any;
}

export async function getAdapterRoutes({ adapter, chain, from, to, amount, extra = {} }: IGetAdapterRouteProps) {
	if (!chain || !from || !to || !amount || amount === '0') {
		return {
			price: null,
			name: adapter.name,
			airdrop: !adapter.token,
			fromAmount: amount,
			txData: '',
			l1Gas: 0,
			tx: {}
		};
	}

	try {
		let price;
		if (extra.isPrivacyEnabled || adapter.name === matcha0xName) {
			price = await redirectQuoteReq(adapter.name, chain, from, to, amount, extra);
		} else {
			price = await adapter.getQuote(chain, from, to, amount, {
				...extra
			});
		}

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
			fromAmount: amount
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
			tx: {}
		};
	}
}

export function useGetRoutes({ chain, from, to, amount, extra = {} }: IGetListRoutesProps) {
	const res = useQueries({
		queries: adapters
			.filter((adap) => adap.chainToId[chain] !== undefined)
			.map<UseQueryOptions<IRoute>>((adapter) => {
				return {
					queryKey: ['routes', adapter.name, chain, from, to, amount, JSON.stringify(omit(extra, 'amount'))],
					queryFn: () => getAdapterRoutes({ adapter, chain, from, to, amount, extra }),
					refetchInterval: 25_000,
					refetchOnWindowFocus: false,
					refetchIntervalInBackground: false
				};
			})
	});

	return {
		isLoading: res.filter((r) => r.status === 'success').length >= 1 ? false : true,
		data: res?.filter((r) => r.status === 'success' && !!r.data && r.data.price).map((r) => r.data) ?? [],
		refetch: () => res?.forEach((r) => r.refetch())
	};
}
