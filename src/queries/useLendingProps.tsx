import { useQuery } from '@tanstack/react-query';
import { getLendingProps } from '~/props/getLendingProps';

export const useLendingProps = () => {
	const res = useQuery(['lendingProps'], getLendingProps);
	return { ...res, data: res.data || { yields: [], chainList: [], categoryList: [], allPools: [], tokens: [] } };
};
