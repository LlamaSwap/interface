import * as React from 'react';
import { ChakraProvider, DarkMode } from '@chakra-ui/react';
import { Hydrate, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAnalytics } from '~/hooks';
import '~/Theme/globals.css';
import { WalletWrapper } from '~/components/WalletProvider';

function App({ Component, pageProps }) {
	const [queryClient] = React.useState(() => new QueryClient());

	useAnalytics();

	const [isMounted, setIsMounted] = React.useState(false);

	React.useEffect(() => {
		setIsMounted(true);
	}, []);

	return (
		<QueryClientProvider client={queryClient}>
			<Hydrate state={pageProps.dehydratedState}>
				<ChakraProvider>
					<DarkMode>
						{isMounted && (
							<WalletWrapper>
								<Component {...pageProps} />
							</WalletWrapper>
						)}
					</DarkMode>
				</ChakraProvider>
			</Hydrate>
		</QueryClientProvider>
	);
}

export default App;
