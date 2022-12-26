import { useQueries, UseQueryOptions } from '@tanstack/react-query';
import { omit } from 'lodash';
import { redirectQuoteReq } from '~/components/Aggregator/adapters/utils';
import { adapters } from '~/components/Aggregator/router';

interface IGetListRoutesProps {
	chain: string;
	from?: string;
	to?: string;
	amount?: string;
	extra?: any;
}

interface IRoute {
	price: { amountReturned: any; estimatedGas: any; tokenApprovalAddress: any; logo: string; feeAmount?: number } | null;
	name: string;
	airdrop: boolean;
	fromAmount: string;
	txData: string;
}

interface IGetAdapterRouteProps extends IGetListRoutesProps {
	adapter: any;
}

export async function getAdapterRoutes({ adapter, chain, from, to, amount, extra = {} }: IGetAdapterRouteProps) {
	if (!chain || !from || !to || !amount || amount === '0') {
		return { price: null, name: adapter.name, airdrop: !adapter.token, fromAmount: amount, txData: '' };
	}

	try {
		let price;
		if (extra.isPrivacyEnabled) {
			price = await redirectQuoteReq(adapter.name, chain, from, to, amount, extra);
		} else {
			price = await adapter.getQuote(chain, from, to, amount, {
				...extra
			});
		}

		const res = {
			price,
			txData: adapter?.getTxData?.(price) ?? '',
			name: adapter.name,
			airdrop: !adapter.token,
			fromAmount: amount
		};

		return res;
	} catch (e) {
		console.error(e);
		return {
			price: null,
			name: adapter.name,
			airdrop: !adapter.token,
			fromAmount: amount,
			txData: ''
		};
	}
}

export function useGetRoutes({ chain, from, to, amount, extra = {} }: IGetListRoutesProps) {
	const res = useQueries({
		queries: adapters
			.filter((adap) => adap.chainToId[chain] !== undefined)
			.map<UseQueryOptions<IRoute>>((adapter) => {
				return {
					queryKey: ['routes', adapter.name, chain, from, to, amount, JSON.stringify(omit(extra, 'selectedRoute'))],
					queryFn: () => getAdapterRoutes({ adapter, chain, from, to, amount, extra }),
					refetchInterval: 15_000,
					onSuccess: (data) => {
						if (data.name === extra.selectedRoute) extra.setRoute(data);
					}
				};
			})
	});

	return {
		isLoading: res.filter((r) => r.status === 'success').length >= 1 ? false : true,
		data: res?.filter((r) => r.status === 'success' && !!r.data && r.data.price).map((r) => r.data) ?? []
	};
}
