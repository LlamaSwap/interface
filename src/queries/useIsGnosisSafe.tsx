import { useQuery } from '@tanstack/react-query';
import { providers } from '~/components/Aggregator/rpcs';

export const checkGnosisSafe = async (address: string, chain: string) => {
	const code = await providers[chain].getCode(address);

	const isGnosisSafe = code !== '0x';
	const isIframe = window !== parent;
	const isGnosisSafeApp = isGnosisSafe && isIframe;

	return { isGnosisSafe, isIframe, isGnosisSafeApp };
};

export const useIsGnosisSafe = (address, chain) => {
	const res = useQuery(['isGnosisSafe', address, chain], () => checkGnosisSafe(address, chain));

	return {
		isGnosisSafe: res?.data?.isGnosisSafe,
		isIframe: res?.data?.isIframe,
		isGnosisSafeApp: res?.data?.isGnosisSafeApp
	};
};
