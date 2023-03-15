import {
	Button,
	Checkbox,
	Heading,
	HStack,
	List,
	ListItem,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	useDisclosure
} from '@chakra-ui/react';
import { chunk } from 'lodash';

export const Settings = ({ adapters, enabledAdapters, setEnabledAdapters, onClose: onExternalClose }) => {
	const { isOpen, onClose } = useDisclosure({ defaultIsOpen: true });
	const onCloseClick = () => {
		onExternalClose();
		onClose();
	};
	const onClick = (name) => (e) => {
		const isChecked = e.target.checked;

		console.log(name, isChecked);

		setEnabledAdapters((adapters) =>
			isChecked ? adapters.concat(name) : adapters.filter((adapterName) => adapterName !== name)
		);
	};
	const aggregatorChunks = chunk(adapters, 5);
	return (
		<>
			<Modal isOpen={isOpen} onClose={onCloseClick} size={'lg'}>
				<ModalOverlay />
				<ModalContent color={'white'} justifyContent={'center'}>
					<ModalHeader>Settings</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<Heading size={'xs'}>Enabled Aggregators</Heading>

						<HStack mt={4}>
							{aggregatorChunks.map((aggs) => (
								<List key={aggs.join(',')} spacing={1.5}>
									{aggs.map((name: string) => (
										<ListItem key={name}>
											<Checkbox mr={2} isChecked={enabledAdapters.includes(name)} onChange={onClick(name)} />
											{name}
										</ListItem>
									))}
								</List>
							))}
						</HStack>
					</ModalBody>

					<ModalFooter>
						<Button colorScheme="blue" mr={3} onClick={onCloseClick}>
							Close
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
};
