import { Alert, AlertIcon } from '@chakra-ui/react';

export const Sandwich = ({ sandiwichData }) => {
	if (!sandiwichData) return null;

	return (
		<Alert status="warning" borderRadius="0.375rem" py="8px">
			<AlertIcon />
			{`This pair has been sandwiched ${sandiwichData.sandwiched} times in the last 30 days. We suggest you to reduce the slippage.`}
		</Alert>
	);
};
