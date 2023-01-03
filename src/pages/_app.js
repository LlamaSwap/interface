import * as React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { Hydrate, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAnalytics } from '~/hooks';
import '~/Theme/globals.css';
import { WalletWrapper } from '~/components/WalletProvider';

const setChakraMode = () => {
	localStorage.setItem('chakra-ui-color-mode', 'dark');
};

function App({ Component, pageProps }) {
	const [queryClient] = React.useState(() => new QueryClient());

	useAnalytics();

	const [isMounted, setIsMounted] = React.useState(false);

	React.useEffect(() => {
		setIsMounted(true);
		setChakraMode();
	}, []);

	return (
		<QueryClientProvider client={queryClient}>
			<Hydrate state={pageProps.dehydratedState}>
				<ChakraProvider>
					{isMounted && (
						<WalletWrapper>
							<Component {...pageProps} />
						</WalletWrapper>
					)}
				</ChakraProvider>
			</Hydrate>
		</QueryClientProvider>
	);
}

export default App;
