import { useQuery } from '@tanstack/react-query';
import { getLendingProps } from '~/props/getLendingProps';

export const useLendingProps = () => {
	const res = useQuery({ queryKey: ['lendingProps'], queryFn: getLendingProps });
	return { ...res, data: res.data || { yields: [], chainList: [], categoryList: [], allPools: [], tokens: [] } };
};
