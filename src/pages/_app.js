import * as React from 'react';
import { ChakraProvider, DarkMode } from '@chakra-ui/react';
import { HydrationBoundary, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '~/Theme/globals.css';
import { WalletWrapper } from '~/components/WalletProvider';

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
							<WalletWrapper>
								<Component {...pageProps} />
							</WalletWrapper>
						)}
					</DarkMode>
				</ChakraProvider>
			</HydrationBoundary>
		</QueryClientProvider>
	);
}

export default App;
