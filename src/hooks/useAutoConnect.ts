import { useConnect, useClient } from 'wagmi';
import { useEffect } from 'react';

function useAutoConnect() {
	const { connect, connectors } = useConnect();
	const wagmiClient = useClient();

	useEffect(() => {
		// check for iframe
		if (window !== parent) {
			const connectorInstance = connectors.find((c) => c.id === 'safe' && c.ready);

			if (connectorInstance) {
				connect({ connector: connectorInstance });
			}
		} else {
			wagmiClient.autoConnect();
		}
	}, [connect, connectors]);
}

export { useAutoConnect };
