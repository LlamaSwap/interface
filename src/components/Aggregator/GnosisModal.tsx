import {
	AlertDialog,
	AlertDialogBody,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogOverlay,
	Button,
	Link,
	useDisclosure
} from '@chakra-ui/react';
import React from 'react';
import { useDisconnect } from 'wagmi';

const gnosisSafeChainsMap = {
	ethereum: 'eth',
	gnosis: 'gno',
	polygon: 'matic',
	bsc: 'bnb',
	arbitrum: 'arb1',
	aurora: 'aurora',
	avax: 'avax',
	optimism: 'oeth'
};

const getGnosisUrl = (account, chain) =>
	`https://app.safe.global/${gnosisSafeChainsMap[chain]}:${account}/apps?appUrl=${location.href}`;

export const getGnosisTxUrl = (account, hash, chain) =>
	`https://app.safe.global/${gnosisSafeChainsMap[chain]}:${account}/transactions/tx?id=multisig_${account}_${hash}`;

function GnosisModal({ account, chain }) {
	const { isOpen, onClose } = useDisclosure({ defaultIsOpen: true });

	const { disconnect } = useDisconnect();
	const cancelRef = React.useRef();

	const onCloseClick = () => {
		disconnect();
		onClose();
	};

	const safeUrl = getGnosisUrl(account, chain);

	return (
		<AlertDialog
			motionPreset="slideInBottom"
			isOpen={isOpen}
			isCentered
			leastDestructiveRef={cancelRef}
			onClose={() => {}}
			closeOnOverlayClick={false}
		>
			<AlertDialogOverlay />

			<AlertDialogContent color="white">
				<AlertDialogHeader>Gnosis Safe connection</AlertDialogHeader>
				<AlertDialogBody>
					You have connected Gnosis Safe wallet, to use LlamaSwap you need to go to Gnosis site or disconnect your
					account.
				</AlertDialogBody>
				<AlertDialogFooter>
					<Button onClick={() => onCloseClick()}>Disconnect</Button>
					<Button colorScheme="green" ml={3}>
						<Link href={safeUrl} isExternal>
							Open Gnosis Safe app
						</Link>
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

export default GnosisModal;
