import { Alert, AlertIcon, Link, Text } from '@chakra-ui/react';

export const Sandwich = ({ sandiwichData }) => {
	if (!sandiwichData) return null;

	const sandwichPercent = Number((sandiwichData?.sandwiched / sandiwichData?.trades) * 100).toFixed(2);

	return (
		<Alert status="warning" borderRadius="0.375rem" py="8px" key="sandwichdata">
			<AlertIcon />
			<div>
				{`${sandwichPercent}% of the swaps of this pair were affected by a sandwich attack. We suggest you to reduce the slippage.`}
				<Text mt={2} color="gray.300" textAlign="right" fontSize={'11px'}>
					Sandwich data provided by{' '}
					<Link isExternal href="https://twitter.com/EigenPhi" textDecoration="underline">
						EigenPhi
					</Link>
				</Text>
			</div>
		</Alert>
	);
};
