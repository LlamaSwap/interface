import { useQuery } from '@tanstack/react-query';
import { getYieldsProps } from '~/props/getYieldsProps';

export const useYieldProps = () => {
	const res = useQuery({ queryKey: ['yieldProps'], queryFn: getYieldsProps });
	return { ...res, data: res.data || { data: [], config: {} } };
};
