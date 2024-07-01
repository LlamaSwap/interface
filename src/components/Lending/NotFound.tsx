import llamasWifCoins from './llamas_wif_coins.png';
import llamaWifBinoculars from './llama_wif_binoculars.png';

import { Text } from '@chakra-ui/react';

const NotFound = ({ hasSelectedFilters = false, text, size = '150px' }) => {
	return (
		<div
			style={{
				width: '100%',
				height: '70%',
				position: 'absolute',
				top: '50%',
				left: '0',
				transform: 'translateY(-50%)',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
				display: 'flex'
			}}
		>
			<img
				src={hasSelectedFilters ? llamaWifBinoculars.src : llamasWifCoins.src}
				style={{ width: size, height: 'auto' }}
				alt="llamas"
			/>
			<Text fontSize="16px" w={'240px'} textAlign={'center'} mt={4} color="gray.300">
				{text}
			</Text>
		</div>
	);
};

export default NotFound;
