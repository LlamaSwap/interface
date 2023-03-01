import { useState, useEffect } from 'react';

export const useIsClient = () => {
	const [isClient, setIsClient] = useState(false);

	const windowType = typeof window;

	useEffect(() => {
		if (windowType !== 'undefined') {
			setIsClient(true);
		}
	}, [windowType]);

	return isClient;
};
