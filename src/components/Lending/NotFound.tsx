import llamasWifCoins from './llamas_wif_coins.png';
import llamaWifBinoculars from './llama_wif_binoculars.png';

import { Text } from '@chakra-ui/react';

const NotFound = ({
	hasSelectedFilters,
	notFoundText = 'No pools found for the selected filters.',
	defaultText = ''
}) => {
	return (
		<div
			style={{
				width: '100%',
				height: '70%',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
				display: 'flex'
			}}
		>
			<img
				src={hasSelectedFilters ? llamaWifBinoculars.src : llamasWifCoins.src}
				style={{ width: '200px', height: 'auto' }}
				alt="llamas"
			/>
			<Text fontSize="16px" w={'240px'} textAlign={'center'} mt={4} color="gray.300">
				{hasSelectedFilters ? notFoundText : defaultText}
			</Text>
		</div>
	);
};

export default NotFound;
