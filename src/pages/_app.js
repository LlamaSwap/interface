import LocalStorageContextProvider, {
  Updater as LocalStorageContextUpdater,
} from '~/contexts/LocalStorage';
import { useAnalytics } from '~/hooks';
import '~/Theme/globals.css';
import { ChakraProvider } from '@chakra-ui/react';

function App({ Component, pageProps }) {
  useAnalytics();

  return (
    <ChakraProvider>
      <LocalStorageContextProvider>
        <LocalStorageContextUpdater />
        <Component {...pageProps} />
      </LocalStorageContextProvider>
    </ChakraProvider>
  );
}

export default App;
