import * as React from 'react';
import { ChakraProvider, DarkMode } from '@chakra-ui/react';
import { HydrationBoundary, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import styled from 'styled-components';
import { darkTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import '~/Theme/globals.css';
import { config } from '~/components/WalletProvider';

const Provider = styled.div`
	width: 100%;
	& > div {
		width: 100%;
	}
`;

function App({ Component, pageProps }) {
	const [queryClient] = React.useState(() => new QueryClient());

	const [isMounted, setIsMounted] = React.useState(false);

	React.useEffect(() => {
		setIsMounted(true);
	}, []);

	return (
		<QueryClientProvider client={queryClient}>
			<HydrationBoundary state={pageProps.dehydratedState}>
				<ChakraProvider>
					<DarkMode>
						{isMounted && (
							<WagmiProvider config={config}>
								<Provider>
									<RainbowKitProvider showRecentTransactions={true} theme={darkTheme()}>
										<Component {...pageProps} />
									</RainbowKitProvider>
								</Provider>
							</WagmiProvider>
						)}
					</DarkMode>
				</ChakraProvider>
			</HydrationBoundary>
		</QueryClientProvider>
	);
}

export default App;
