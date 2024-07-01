import { useQuery } from '@tanstack/react-query';
import { getYieldsProps } from '~/props/getYieldsProps';

export const useYieldProps = () => {
	const res = useQuery(['yieldProps'], getYieldsProps);
	return { ...res, data: res.data || { data: [], config: {} } };
};
