import { useQuery } from '@tanstack/react-query';
import { providers } from '~/components/Aggregator/rpcs';

export const checkGnosisSafe = async (address: string, chain: string) => {
	const code = await providers[chain].getCode(address);

	return code !== '0x' && window === parent;
};

export const useIsGnosisSafe = (address, chain) => {
	return useQuery(['isGnosisSafe', address, chain], () => checkGnosisSafe(address, chain));
};
