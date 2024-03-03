import { useQuery } from '@tanstack/react-query';
import { useQueryParams } from '~/hooks/useQueryParams';

const chains = {
	ethereum: 'mainnet',
	gnosis: 'xdai'
};

const getOrdersUrl = (chain, address) =>
	`https://api.cow.fi/${chain}/api/v1/account/${address}/orders?offset=0&limit25`;

const getCowHistory = async ({ userAddress, chain, onlyNative }) => {
	const orders = await fetch(getOrdersUrl(chain, userAddress)).then((r) => r.json());

	return onlyNative ? orders.filter((order) => !!order?.ethflowData) : orders;
};

export function useCowOrders({ userAddress, onlyNative = false, isOpen = false }) {
	const { chainName } = useQueryParams();
	const chain = chains[chainName];
	return useQuery(
		['getCowHistory', userAddress, chain, isOpen],
		() => getCowHistory({ userAddress, chain, onlyNative }),
		{
			enabled: !!userAddress && !!chain,
			staleTime: 10_000
		}
	);
}
