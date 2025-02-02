import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { rpcsTransports } from '../Aggregator/rpcs';
import { allChains } from './chains';

const projectId = 'b3d4ba9fb97949ab12267b470a6f31d2';

export const config = getDefaultConfig({
	appName: 'LlamaSwap',
	projectId,
	chains: allChains as any,
	transports: rpcsTransports,
	ssr: false
});

declare module 'wagmi' {
	interface Register {
		config: typeof config;
	}
}
