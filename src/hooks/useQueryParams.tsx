import { ethers } from 'ethers';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAccount, useNetwork } from 'wagmi';
import { getAllChains } from '~/components/Aggregator/router';

const chains = getAllChains();

export function useQueryParams() {
	const router = useRouter();
	const { isConnected } = useAccount();
	const { chain: chainOnWallet } = useNetwork();

	const { chain: chainOnURL, from: fromToken, to: toToken } = router.query;

	const chainName = typeof chainOnURL === 'string' ? chainOnURL.toLowerCase() : 'ethereum';
	const fromTokenAddress = typeof fromToken === 'string' ? fromToken.toLowerCase() : null;
	const toTokenAddress = typeof toToken === 'string' ? toToken.toLowerCase() : null;

	useEffect(() => {
		if (router.isReady && isConnected && !chainOnURL && chainOnWallet) {
			const chain = chains.find((c) => c.chainId === chainOnWallet.id);

			// redirects to ethereum, when chain on wallet is not supported
			if (chainOnWallet.unsupported || !chain) {
				router.push(
					{
						pathname: '/',
						query: { chain: 'ethereum', from: ethers.constants.AddressZero }
					},
					undefined,
					{ shallow: true }
				);
			} else {
				// redirects to chain on wallet if supported
				router.push(
					{
						pathname: '/',
						query: { chain: chain.value, from: ethers.constants.AddressZero }
					},
					undefined,
					{ shallow: true }
				);
			}
		}
	}, [chainOnURL, chainOnWallet, isConnected, router]);

	return { chainName, fromTokenAddress, toTokenAddress };
}
