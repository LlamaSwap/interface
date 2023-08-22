import { InfoOutlineIcon } from '@chakra-ui/icons';
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
	Switch,
	Tooltip,
	useDisclosure
} from '@chakra-ui/react';
import { chunk } from 'lodash';
import { useLocalStorage } from '~/hooks/useLocalStorage';

export const Settings = ({ adapters, disabledAdapters, setDisabledAdapters, onClose: onExternalClose }) => {
	const [isDegenModeEnabled, setIsDegenModeEnabled] = useLocalStorage('llamaswap-degenmode', false);
	const [cowswapDeadline, setCowswapDeadline] = useLocalStorage('llamaswap-cowswapDeadline', 30);
	const { isOpen, onClose } = useDisclosure({ defaultIsOpen: true });
	const onCloseClick = () => {
		onExternalClose();
		onClose();
	};
	const onClick = (name) => (e) => {
		const isChecked = e.target.checked;

		setDisabledAdapters((adaptersState) =>
			isChecked ? adaptersState.filter((adapterName) => adapterName !== name) : adaptersState.concat(name)
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
						<HStack mt={1} mb={4}>
							<Heading size={'xs'}>Degen Mode</Heading>{' '}
							<Tooltip label="Disable price impact warnings.">
								<InfoOutlineIcon />
							</Tooltip>
							<Switch onChange={() => setIsDegenModeEnabled((mode) => !mode)} isChecked={isDegenModeEnabled} />
						</HStack>
						<HStack mt={1} mb={4}>
							<Heading size={'xs'}>CowSwap Deadline</Heading>{' '}
							<Tooltip label="Your swap will expire if not executed for longer than the duration set here">
								<InfoOutlineIcon />
							</Tooltip>
							<input
								onChange={(d) => {
									const num = Number(d.target.value);
									if (num <= 180 && num >= 2 && Number.isInteger(num)) {
										setCowswapDeadline(num);
									} else {
										setCowswapDeadline(30);
									}
								}}
								min={2}
								step={1}
								type="number"
								max="180"
								value={cowswapDeadline}
								style={{
									width: '3em',
									borderRadius: '0.4em',
									textAlign: 'end'
								}}
							/>{' '}
							<span>minutes</span>
						</HStack>
						<Heading size={'xs'}>Enabled Aggregators</Heading>

						<HStack mt={4}>
							{aggregatorChunks.map((aggs) => (
								<List key={aggs.join(',')} spacing={1.5}>
									{aggs.map((name: string) => (
										<ListItem key={name}>
											<Checkbox mr={2} isChecked={!disabledAdapters.includes(name)} onChange={onClick(name)} />
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
