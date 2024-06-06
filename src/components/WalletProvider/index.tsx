import * as React from 'react';
import { darkTheme, getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { WagmiProvider } from 'wagmi';

import styled from 'styled-components';
import { allChains } from './chains';
import { rpcsTransports } from '../Aggregator/rpcs';

const Provider = styled.div`
	width: 100%;
	& > div {
		width: 100%;
	}
`;

const projectId = 'b3d4ba9fb97949ab12267b470a6f31d2';

export const config = getDefaultConfig({
	appName: 'LlamaSwap',
	projectId,
	chains: allChains as any,
	transports: rpcsTransports
});

export const WalletWrapper = ({ children }: { children: React.ReactNode }) => {
	return (
		<WagmiProvider config={config}>
			<Provider>
				<RainbowKitProvider showRecentTransactions={true} theme={darkTheme()}>
					{children}
				</RainbowKitProvider>
			</Provider>
		</WagmiProvider>
	);
};
