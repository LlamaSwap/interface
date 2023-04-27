import {
	Button,
	Input,
	Popover,
	PopoverArrow,
	PopoverBody,
	PopoverCloseButton,
	PopoverContent,
	PopoverHeader,
	PopoverTrigger,
	useDisclosure
} from '@chakra-ui/react';
import React, { useState } from 'react';

const SwapConfiramtion = ({ handleSwap, isUnknownPrice = false, isMaxPriceImpact = false }) => {
	const { isOpen, onToggle, onClose } = useDisclosure();
	const requiredText = isMaxPriceImpact ? 'trade' : 'confirm';
	const [value, setValue] = useState('');
	const isSwapDisabled = value?.toLowerCase() !== requiredText;

	const onPopoverClose = () => {
		setValue('');
		onClose();
	};

	return (
		<>
			<Popover returnFocusOnClose={false} isOpen={isOpen} onClose={onPopoverClose} placement="top">
				<PopoverTrigger>
					<Button colorScheme="red" onClick={() => onToggle()}>
						Swap
					</Button>
				</PopoverTrigger>
				<PopoverContent>
					<PopoverArrow />
					<PopoverCloseButton />
					<PopoverHeader>Swap Confirmation.</PopoverHeader>

					{isUnknownPrice ? (
						<PopoverBody>
							We can't get price for one of your tokens. <br />
							Check output amount of the selected route carefully.
							<Button colorScheme={'red'} onClick={handleSwap} mt={4}>
								Swap
							</Button>
						</PopoverBody>
					) : (
						<PopoverBody>
							Price impact is too high.
							<br />
							You'll likely lose money.
							<br />
							Type "{requiredText}" to make a swap.
							<Input
								placeholder="Type here..."
								mt={'4px'}
								onChange={(e) => setValue(e.target.value)}
								value={value}
							></Input>
							<Button colorScheme={'red'} onClick={handleSwap} mt={4} isDisabled={isSwapDisabled}>
								Swap with high slippage
							</Button>
						</PopoverBody>
					)}
				</PopoverContent>
			</Popover>
		</>
	);
};

export default SwapConfiramtion;
