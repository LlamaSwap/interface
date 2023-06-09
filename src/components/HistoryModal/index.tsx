import { ArrowForwardIcon } from '@chakra-ui/icons';
import {
	Box,
	Button,
	HStack,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalHeader,
	ModalOverlay,
	Text,
	useDisclosure,
	VStack
} from '@chakra-ui/react';
import styled from 'styled-components';
import { useAccount } from 'wagmi';
import { useSwapsHistory } from '~/queries/useSwapsHistory';
import Loader from '../Aggregator/Loader';
const RouteWrapper = styled.div`
	display: grid;
	grid-row-gap: 4px;
	margin-top: 16px;
	height: fit-content;
	&.is-selected {
		border-color: rgb(31 114 229);
		background-color: rgb(3 11 23);
	}

	background-color: #2d3039;
	border: 1px solid #373944;
	padding: 7px 15px 9px;
	border-radius: 8px;
	cursor: pointer;

	animation: swing-in-left-fwd 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
	@keyframes swing-in-left-fwd {
		0% {
			transform: rotateX(100deg);
			transform-origin: left;
			opacity: 0;
		}
		100% {
			transform: rotateX(0);
			transform-origin: left;
			opacity: 1;
		}
	}
	.secondary-data {
		opacity: 0;
		transition: opacity 0.2s linear;
	}
	&:hover {
		background-color: #161616;
	}
	&:hover,
	&.is-selected,
	&:first-of-type {
		.secondary-data {
			opacity: 1;
		}
	}
`;

const Body = styled.div`
	height: 580px;
	overflow: auto;
	&::-webkit-scrollbar {
		display: none;
	}
	-ms-overflow-style: none;
	scrollbar-width: none;
`;

const NoHistory = () => {
	return (
		<Box mt="200px" display={'flex'} justifyContent="center">
			<Text fontSize={'20px'} fontWeight="bold">
				No transaction history
			</Text>
		</Box>
	);
};

function HistoryModal({ tokensUrlMap, tokensSymbolsMap }) {
	const user = useAccount();
	const { isOpen, onOpen, onClose } = useDisclosure();

	const { data: history, isLoading } = useSwapsHistory({
		userId: user?.address,
		tokensUrlMap,
		tokensSymbolsMap,
		isOpen
	});
	return (
		<>
			<Button
				onClick={onOpen}
				borderRadius="12px"
				height="36px"
				mt="2px"
				colorScheme={'twitter'}
				display={{ base: 'none', sm: 'none', lg: 'block', md: 'block' }}
			>
				History
			</Button>

			<Modal isOpen={isOpen} onClose={onClose} size="lg">
				<ModalOverlay />
				<ModalContent backgroundColor={'#22242A'} color="white">
					<ModalHeader>Swaps History</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						{isLoading && user?.address ? (
							<Box display="flex" height="580px" padding={'120px'}>
								<Loader />
							</Box>
						) : (
							<Body>
								{!history?.length ? (
									<NoHistory />
								) : (
									history?.map((tx) =>
										tx?.route ? (
											<RouteWrapper key={tx.id} onClick={() => window.open(tx.txUrl)}>
												<VStack>
													<HStack justifyContent={'space-between'} w="100%">
														<VStack alignItems={'baseline'}>
															<div style={{ fontWeight: '500', display: 'flex' }}>
																<HStack>
																	<img
																		src={tx.fromIcon}
																		style={{ borderRadius: '50%', width: '20px', height: '20px' }}
																		alt="fromIcon"
																	/>
																	<img
																		src={tx.toIcon}
																		style={{ borderRadius: '50%', marginLeft: '-4px', width: '20px', height: '20px' }}
																		alt="toIcon"
																	/>
																</HStack>
																<div style={{ marginLeft: '8px' }}>
																	{tx.fromSymbol} <ArrowForwardIcon /> {tx.toSymbol} via {tx.aggregator}
																</div>
															</div>
															<Text>{new Date(tx.createdAt).toLocaleDateString()}</Text>
														</VStack>
														<VStack>
															<Text w="100%" textAlign={'end'} color="red.400">
																-
																{Number(tx?.amount).toLocaleString('en', {
																	maximumFractionDigits: 5,
																	notation: 'compact'
																})}{' '}
																{tx.fromSymbol}
															</Text>
															<Text w="100%" textAlign={'end'} color="green.400">
																+
																{Number(tx?.route?.amount).toLocaleString('en', {
																	maximumFractionDigits: 5,
																	notation: 'compact'
																})}{' '}
																{tx.toSymbol}
															</Text>
														</VStack>
													</HStack>
												</VStack>
											</RouteWrapper>
										) : null
									)
								)}
							</Body>
						)}
					</ModalBody>
				</ModalContent>
			</Modal>
		</>
	);
}

export { HistoryModal };
