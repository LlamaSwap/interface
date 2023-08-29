import { CheckCircleIcon, TriangleDownIcon } from '@chakra-ui/icons';
import {
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalOverlay,
	Text,
	Spinner,
	Button
} from '@chakra-ui/react';
import { IToken } from '~/types';
import { IconImage } from '../Aggregator/Search';

interface Props {
	open: boolean;
	setOpen: (value: boolean) => void;
	swap: () => void;
	isLoading: boolean;
	fromToken: IToken;
}

export const SwapModal = ({ open, setOpen, swap, isLoading, fromToken }: Props) => {
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
					<Text display={'flex'} fontSize="xl" fontWeight={'bold'}>
						Swapping {fromToken?.symbol}
						<IconImage
							style={{ marginLeft: '10px', height: '26px', marginTop: '2px' }}
							src={fromToken?.logoURI}
							onError={(e) => (e.currentTarget.src = fromToken?.logoURI2 || '/placeholder.png')}
						/>
					</Text>
					<TriangleDownIcon />
					<Text as="h1" fontSize="xl" fontWeight={'bold'}>
						{isLoading ? 'Waiting for approval' : 'Token approved'}{' '}
						{isLoading ? (
							<Spinner color="blue.300" ml="8px" w="1.25rem" h="1.25rem" />
						) : (
							<CheckCircleIcon color={'green.300'} ml="8px" />
						)}
					</Text>
					<TriangleDownIcon />
					<Button
						w={'180px'}
						isDisabled={isLoading}
						fontSize={'lg'}
						textAlign={'center'}
						padding="6px 1rem"
						borderRadius="0.375rem"
						bg="#a2cdff"
						margin="0 1rem 1rem"
						color="black"
						_hover={{ textDecoration: 'none' }}
						onClick={() => {
							swap();
							setOpen(false);
						}}
					>
						Swap
					</Button>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
};
