import { useQuery } from '@tanstack/react-query';
import { LLAMA_SERVER_URL } from '../constants';

const getBlackListStatus = async ({ address, chain }) => {
	const blacklist = await fetch(`${LLAMA_SERVER_URL}/getBlackListedTokens/?chain=${chain}&address=${address}`).then(
		(r) => r.json()
	);
	const isBlacklisted = blacklist.some((token) => token?.address?.toLowerCase() === address?.toLowerCase());
	return isBlacklisted;
};

export const usePermitsBlackList = ({ address, chain }) => {
	const { data, refetch } = useQuery(['getBlackListStatus', address, chain], () =>
		getBlackListStatus({ address, chain })
	);

	const addToBlackList = () => {
		fetch(`${LLAMA_SERVER_URL}/storeBlacklistPermit`, {
			method: 'POST',
			body: JSON.stringify({
				address,
				chain
			})
		}).then(() => refetch());
	};

	return { isBlackListed: data, addToBlackList };
};
