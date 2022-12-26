import { IconButton } from '@chakra-ui/react';
import { CrossIcon } from '../Icons';

export const CloseBtn = ({ onClick, ...props }) => (
	<IconButton
		bg="none"
		pos="absolute"
		top="-4px"
		right="-8px"
		icon={<CrossIcon />}
		aria-label="close"
		onClick={onClick}
		{...props}
	/>
);
