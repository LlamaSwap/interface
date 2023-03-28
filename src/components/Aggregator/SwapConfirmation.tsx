import {
	Button,
	Popover,
	PopoverArrow,
	PopoverBody,
	PopoverCloseButton,
	PopoverContent,
	PopoverHeader,
	PopoverTrigger
} from '@chakra-ui/react';
import React from 'react';

const SwapConfiramtion = ({ handleSwap }) => {
	return (
		<>
			<Popover>
				<PopoverTrigger>
					<Button colorScheme={'red'}>Swap</Button>
				</PopoverTrigger>
				<PopoverContent>
					<PopoverArrow />
					<PopoverCloseButton />
					<PopoverHeader>Swap Confirmation.</PopoverHeader>
					<PopoverBody>
						Price impact is too high.
						<br />
						You'll likely lose money.
						<br />
						Are you sure you want to make this swap?
						<Button colorScheme={'red'} onClick={handleSwap} mt={4}>
							Swap with high slippage
						</Button>
					</PopoverBody>
				</PopoverContent>
			</Popover>
		</>
	);
};

export default SwapConfiramtion;
