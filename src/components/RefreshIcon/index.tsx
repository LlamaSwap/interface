import { useCountdown } from '~/hooks/useCountdown';
import { REFETCH_INTERVAL } from '~/queries/useGetRoutes';
import { RepeatIcon } from '@chakra-ui/icons';
import { CircularProgress } from '@chakra-ui/react';
import { Tooltip2 } from '../Tooltip';

export const RefreshIcon = ({ refetch, lastFetched }: { refetch: () => void; lastFetched: number }) => {
	const secondsToRefresh = useCountdown(lastFetched + REFETCH_INTERVAL);

	return (
		<Tooltip2
			content={`Displayed data will auto-refresh after ${secondsToRefresh} seconds. Click here to update manually`}
		>
			<RepeatIcon pos="absolute" w="16px	" h="16px" mt="4px" ml="4px" />
			<CircularProgress
				value={100 - (secondsToRefresh / (REFETCH_INTERVAL / 1000)) * 100}
				color="blue.400"
				onClick={refetch}
				size="24px"
				as="button"
			/>
		</Tooltip2>
	);
};
