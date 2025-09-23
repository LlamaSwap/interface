import { rpcsTransports } from '../Aggregator/rpcs';
import { allChains } from './chains';
import { porto } from 'porto/wagmi';
import { createConfig } from 'wagmi';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { rainbowWallet, walletConnectWallet, coinbaseWallet, metaMaskWallet } from '@rainbow-me/rainbowkit/wallets';

const projectId = 'b3d4ba9fb97949ab12267b470a6f31d2';

const connectors = connectorsForWallets(
	[
		{
			groupName: 'Recommended',
			wallets: [rainbowWallet, metaMaskWallet, walletConnectWallet, coinbaseWallet]
		}
	],
	{
		appName: 'LlamaSwap',
		projectId
	}
);

export const config = createConfig({
	ssr: false,
	chains: allChains as any,
	transports: rpcsTransports,
	connectors: [porto(), ...connectors]
});

declare module 'wagmi' {
	interface Register {
		config: typeof config;
	}
}
