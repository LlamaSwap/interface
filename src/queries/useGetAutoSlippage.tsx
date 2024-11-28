import { useQuery } from '@tanstack/react-query';
import { getAddress } from 'ethers/lib/utils.js';

interface IGetAutoSlippage {
	fromToken: string;
	toToken: string;
	chainId: number;
	disabled: boolean;
	onError?: () => void;
}

export async function getAutoSlippage({ fromToken, toToken, chainId, disabled }: IGetAutoSlippage) {
	if (chainId !== 1 || disabled || !fromToken || !toToken) {
		return null;
	}

	const data = await fetch(`https://slippage.llama.fi/inference`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ from_address: getAddress(fromToken), to_address: getAddress(toToken) })
	}).then((res) => res.json());

	if (data.error) {
		throw new Error(data.error);
	}

	return data.predictedSlippage;
}

export function useGetAutoSlippage({ fromToken, toToken, chainId, disabled, onError }: IGetAutoSlippage) {
	return useQuery(
		['auto-slippage', fromToken, toToken, chainId, disabled],
		() => getAutoSlippage({ fromToken, toToken, chainId, disabled }),
		{
			refetchOnWindowFocus: false,
			refetchIntervalInBackground: false,
			retry: false,
			onError
		}
	);
}
