import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  trustWallet,
  coinbaseWallet,
  zilPayWallet,
  walletConnectWallet,
  metaMaskWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { rpcsTransports } from '../Aggregator/rpcs';
import { allChains } from './chains';
import type { Config } from 'wagmi';

const projectId = 'b3d4ba9fb97949ab12267b470a6f31d2';

export const config = getDefaultConfig({
	appName: 'LlamaSwap',
	projectId,
	chains: allChains as any,
	transports: rpcsTransports,
	ssr: false,
    wallets: [
        {
            groupName: 'Popular',
            wallets: [
            	metaMaskWallet,
              trustWallet,
            	zilPayWallet,
            ],
        },
        {
            groupName: 'Other',
            wallets: [
                coinbaseWallet,
                walletConnectWallet,
            ],
        },
    ],
}) as Config;
