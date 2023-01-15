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
					<Button colorScheme={'messenger'}>Swap</Button>
				</PopoverTrigger>
				<PopoverContent>
					<PopoverArrow />
					<PopoverCloseButton />
					<PopoverHeader>Swap Confirmation.</PopoverHeader>
					<PopoverBody>
						Price impact is too high. <br />
						Are you sure you want to make a swap?
						<Button colorScheme={'messenger'} onClick={handleSwap} mt={4}>
							Swap
						</Button>
					</PopoverBody>
				</PopoverContent>
			</Popover>
		</>
	);
};

export default SwapConfiramtion;
