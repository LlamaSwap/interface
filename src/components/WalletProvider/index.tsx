import * as React from 'react';
import { connectorsForWallets, darkTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import styled from 'styled-components';
import { allChains } from './chains';
import { rpcsKeys } from '../Aggregator/rpcs';
import {
	rabbyWallet,
	injectedWallet,
	walletConnectWallet,
	metaMaskWallet,
	braveWallet,
	coinbaseWallet,
	phantomWallet,
	safeWallet
} from '@rainbow-me/rainbowkit/wallets';

const { provider, chains } = configureChains(
	[...allChains],
	rpcsKeys.map((key) =>
		jsonRpcProvider({
			rpc: (chain) => ({ http: (chain.rpcUrls[key] as any) || '' })
		})
	)
);

const Provider = styled.div`
	width: 100%;
	& > div {
		width: 100%;
	}
`;

const projectId = 'b3d4ba9fb97949ab12267b470a6f31d2';
const connectors = connectorsForWallets([
	{
		groupName: 'Popular',
		wallets: [
			injectedWallet({ chains }),
			rabbyWallet({ chains }),
			walletConnectWallet({ projectId, chains }),
			metaMaskWallet({ chains, projectId }),
			coinbaseWallet({ chains, appName: 'LlamaSwap' }),
			phantomWallet({ chains }),
			braveWallet({ chains }),
			safeWallet({ chains })
		]
	}
]);

const wagmiClient = createClient({
	autoConnect: true,
	connectors,
	provider
});

export const WalletWrapper = ({ children }: { children: React.ReactNode }) => {
	return (
		<WagmiConfig client={wagmiClient}>
			<Provider>
				<RainbowKitProvider chains={chains} showRecentTransactions={true} theme={darkTheme()}>
					{children}
				</RainbowKitProvider>
			</Provider>
		</WagmiConfig>
	);
};
