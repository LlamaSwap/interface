import { CheckIcon, EditIcon, ExternalLinkIcon, UnlockIcon } from '@chakra-ui/icons';
import {
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalOverlay,
	Text,
	Spinner,
	Button,
	Box,
	Link
} from '@chakra-ui/react';
import { IToken } from '~/types';
import { SWAP_STATES } from '../Aggregator';
import { IconImage } from '../Aggregator/Search';

interface Props {
	isOpen: boolean;
	close: () => void;
	swap: () => void;
	fromToken: IToken;
	toToken: IToken;
	state: SWAP_STATES;
	txUrl?: string;
}

export const SwapModal = ({ isOpen, close, swap, state, fromToken, toToken, txUrl }: Props) => {
	const states = {
		[SWAP_STATES.WAITING_FOR_APPROVAL]: (
			<Box display={'flex'} flexDirection="column" alignItems={'center'} mt="16px">
				<UnlockIcon w={16} h={16} color="blue.300" mb="8px" />
				<Text fontSize={'lg'} fontWeight="bold" mt="8px">
					Enable spending {fromToken?.symbol} on LlamaSwap
				</Text>
				<Text fontSize={'md'}>Proceed in your wallet</Text>
			</Box>
		),

		[SWAP_STATES.CONFIRMING_APPROVAL]: (
			<Box display={'flex'} flexDirection="column" alignItems={'center'} mt="16px">
				<UnlockIcon w={16} h={16} color="green.300" mb="8px" />
				<Text fontSize={'lg'} fontWeight="bold" mt="8px">
					Approve submitted <Spinner color="blue.300" ml="8px" w="1rem" h="1rem" mb="-2px" />
				</Text>
			</Box>
		),
		[SWAP_STATES.WAITING_FOR_SWAP]: (
			<>
				<Box display={'flex'} flexDirection="column" alignItems={'center'} mt="16px">
					<EditIcon w={16} h={16} color="blue.300" mb="8px" />
					<Text fontSize={'lg'} fontWeight="bold" mt="8px">
						Please confirm swap
					</Text>
				</Box>
				<Button colorScheme={'messenger'} width="100%" mt="16px" onClick={() => swap()}>
					Swap
				</Button>
			</>
		),
		[SWAP_STATES.CONFIRMING_SWAP]: (
			<>
				<Box display={'flex'} flexDirection="column" alignItems={'center'} mt="16px">
					<CheckIcon w={16} h={16} color="green.300" mb="8px" />
					<Text fontSize={'lg'} fontWeight="bold">
						Transaction Submitted
					</Text>
				</Box>
				{txUrl ? (
					<Link
						href={txUrl}
						isExternal
						fontSize={'lg'}
						textAlign={'center'}
						padding="6px 1rem"
						borderRadius="0.375rem"
						bg="#a2cdff"
						mt="16px"
						color="black"
						w="100%"
						_hover={{ textDecoration: 'none' }}
					>
						View on explorer <ExternalLinkIcon mx="2px" />
					</Link>
				) : null}
			</>
		)
	};

	return (
		<Modal isCentered motionPreset="slideInBottom" closeOnOverlayClick={true} isOpen={isOpen} onClose={() => close()}>
			<ModalOverlay />
			<ModalContent h="280px">
				<ModalCloseButton color="white" mt="8px" />

				<ModalBody
					display="flex"
					gap="8px"
					flexDir="column"
					alignItems="center"
					marginY="4rem"
					color="white"
					mt="4rem"
					h="480px"
				>
					<Text display={'flex'} fontSize="lg" fontWeight={'bold'} position="absolute" top="18px">
						Swapping {fromToken?.symbol}
						<IconImage
							style={{ marginLeft: '10px', height: '26px', width: '26px', marginTop: '2px', marginRight: '8px' }}
							src={fromToken?.logoURI}
							onError={(e) => (e.currentTarget.src = fromToken?.logoURI2 || '/placeholder.png')}
						/>
						to {toToken?.symbol}{' '}
						<IconImage
							style={{ marginLeft: '10px', height: '26px', width: '26px', marginTop: '2px' }}
							src={toToken?.logoURI}
							onError={(e) => (e.currentTarget.src = toToken?.logoURI2 || '/placeholder.png')}
						/>
					</Text>{' '}
					{states[state]}
				</ModalBody>
			</ModalContent>
		</Modal>
	);
};
