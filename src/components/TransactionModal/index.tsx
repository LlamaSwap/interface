import {
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalOverlay,
	Link as ChakraLink,
	Text
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import {} from 'react-feather';

export const TransactionModal = ({ open, setOpen, link }) => {
	return (
		<Modal
			isCentered
			motionPreset="slideInBottom"
			closeOnOverlayClick={true}
			isOpen={open}
			onClose={() => setOpen(false)}
		>
			<ModalOverlay />
			<ModalContent>
				<ModalCloseButton color="white" />
				<ModalBody display="flex" gap="8px" flexDir="column" alignItems="center" marginY="4rem" color="white">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="80"
						height="80"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="0.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<circle cx="12" cy="12" r="10"></circle>
						<polyline points="16 12 12 8 8 12"></polyline>
						<line x1="12" y1="16" x2="12" y2="8"></line>
					</svg>
					<Text as="h1" fontSize="xl" fontWeight="600">
						Transaction Submitted
					</Text>
					{link?.includes('cow.fi') ? (
						<Text color={'orange.200'} fontWeight="light" padding=" 0px 10px" textAlign={'center'}>
							ETH orders may take 30 minutes to process. Your ETH is safe in a contract during this time. Cancel the
							order for immediate ETH retrieval. Cancellation is available in the 'History' tab for all orders.
						</Text>
					) : null}
				</ModalBody>
				<ChakraLink
					href={link}
					isExternal
					fontSize={'lg'}
					textAlign={'center'}
					padding="6px 1rem"
					borderRadius="0.375rem"
					bg="#a2cdff"
					margin="0 1rem 1rem"
					color="black"
					_hover={{ textDecoration: 'none' }}
				>
					View on explorer <ExternalLinkIcon mx="2px" />
				</ChakraLink>
			</ModalContent>
		</Modal>
	);
};
