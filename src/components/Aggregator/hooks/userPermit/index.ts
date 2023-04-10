import { useMutation, useQuery } from '@tanstack/react-query';
import { ethers } from 'ethers';
import { getAdapterRoutes } from '~/queries/useGetRoutes';
import { chainsMap } from '../../constants';
import { adaptersWithPermit } from '../../list';
import { adaptersMap } from '../../router';
import { usePermitsBlackList } from '../usePermitsBlackList';
import { ABI } from './abi';
import {
	createTypedData,
	DAI_LIKE_PERMIT,
	EIP2612_PERMIT,
	EIP2612_PERMIT_NO_NONCE,
	generateCallParams,
	generateDomains,
	PERMIT_TYPES
} from './utils';

export async function getPermitSignature(
	address: string,
	signer: any,
	spender: string,
	token: string,
	amount: string,
	typeHash: string,
	domain: Record<string, string>,
	onError: () => void
) {
	try {
		const abi =
			typeHash === DAI_LIKE_PERMIT
				? ABI.DAI_LIKE
				: typeHash === EIP2612_PERMIT_NO_NONCE
				? ABI.EIP2612_NO_NONCE
				: ABI.EIP_2612;
		console.log(typeHash === DAI_LIKE_PERMIT, typeHash === EIP2612_PERMIT_NO_NONCE);
		const tokenContract = new ethers.Contract(token, abi, signer);

		let nonce = null;
		try {
			nonce = await tokenContract.nonces(address);
		} catch (e) {
			try {
				nonce = await tokenContract._nonces(address);
			} catch (ee) {}
		}

		const types = PERMIT_TYPES[typeHash] || PERMIT_TYPES[EIP2612_PERMIT];
		const deadline = (Date.now() / 1000).toFixed(0) + 120;

		const message = createTypedData(typeHash, address, spender, amount, nonce, deadline);

		const sig = await signer._signTypedData(domain, types, message);
		const { r, s, v } = { r: sig.slice(0, 66), s: '0x' + sig.slice(66, 130), v: parseInt(sig.slice(130, 132), 16) };

		const callParams = generateCallParams(typeHash, address, spender, deadline, amount, nonce).concat(v, r, s);

		const data = (await tokenContract.populateTransaction.permit(...callParams)).data;

		const permitData = '0x' + data.slice(10);

		return permitData;
	} catch (e) {
		return;
	}
}

const permitSwap = async ({
	signer,
	token,
	spender,
	amount,
	domain,
	typeHash,
	quoteParams,
	aggregator,
	swap,
	blacklist,
	toast
}) => {
	const onError = () => {
		toast({
			title: 'Permit Failed',
			description: 'Permit failed, use approval instead',
			status: 'error',
			duration: 10000,
			isClosable: true,
			position: 'top-right',
			containerStyle: {
				width: '100%',
				maxWidth: '300px'
			}
		});
		// blacklist exotic permits
		const [isBlackListed, addToBlackList] = blacklist;
		if (!isBlackListed) addToBlackList();
	};

	const sig = await getPermitSignature(signer._address, signer, spender, token, amount, typeHash, domain, onError);

	quoteParams.extra.permit = sig;
	if (sig) {
		const quote = await getAdapterRoutes({ adapter: adaptersMap[aggregator], ...quoteParams });

		const tx = await swap(quote.price.rawQuote, onError);
		return tx;
	} else onError();
};

const checkPermitAndGetDomain = async (token, signer, chainId, aggregator, isBlacklisted) => {
	const tokenContract = new ethers.Contract(token, ABI.DAI_LIKE, signer);

	let [typeHash, domain] = [null, null];
	const defaultReturn = { typeHash: null, domain: null, isAvailable: false };

	if (!adaptersWithPermit[aggregator] || isBlacklisted) return defaultReturn;

	try {
		[typeHash, domain] = await Promise.allSettled([tokenContract.PERMIT_TYPEHASH(), tokenContract.DOMAIN_SEPARATOR()]);
		if (!typeHash.value && !domain.value) return defaultReturn;
	} catch (e) {
		return defaultReturn;
	}
	const name = await tokenContract.name();

	const domains = generateDomains(name, token, chainId);
	const currentDomain = domains[domain.value];

	if (!currentDomain) {
		// unknown domain
		return defaultReturn;
	}

	return { domain: currentDomain, isAvailable: true, typeHash: typeHash.value };
};

export const usePermit = ({ signer, token, chain, spender, amount, quoteParams, aggregator, swap, toast }) => {
	const { isBlackListed, addToBlackList } = usePermitsBlackList({ address: token, chain });

	const { data } = useQuery(['checkPermit', token, chain, aggregator, isBlackListed, amount], () =>
		checkPermitAndGetDomain(token, signer, chainsMap[chain], aggregator, isBlackListed)
	);

	const mutation = useMutation({
		mutationFn: () =>
			permitSwap({
				signer,
				token,
				spender,
				amount,
				domain: data?.domain,
				typeHash: data?.typeHash,
				quoteParams,
				aggregator,
				swap,
				blacklist: [isBlackListed, addToBlackList],
				toast
			})
	});

	return {
		swapWithPermit: mutation.mutate,
		isPermitAvailable: data?.isAvailable
	};
};
