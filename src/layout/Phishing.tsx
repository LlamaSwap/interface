import { CheckCircleIcon } from '@chakra-ui/icons';
import { Alert, AlertIcon } from '@chakra-ui/react';
import { useAccount } from 'wagmi';
import { useGetEligibleAirdrops } from '~/queries/useGetEligibleAirdrops';

const Phishing = () => {
	const { address } = useAccount();

	const { data: eligibleAirdrops } = useGetEligibleAirdrops({ address });

	if (eligibleAirdrops) {
		return (
			<Alert status="success" justifyContent={'center'} fontWeight="bold" display={['none', 'none', 'flex', 'flex']}>
				<CheckCircleIcon mr="4px" />
				Congrats! You are eligible to claim {eligibleAirdrops} ODOS
			</Alert>
		);
	}

	return (
		<Alert status="warning" justifyContent={'center'} fontWeight="bold" display={['none', 'none', 'flex', 'flex']}>
			<AlertIcon mr="4px" />
			Please make sure you are on swap.defillama.com - check the URL carefully.
		</Alert>
	);
};

export { Phishing };
