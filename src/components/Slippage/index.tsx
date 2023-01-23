import { Button, Box, Text } from '@chakra-ui/react';

export function Slippage({ slippage, amountUsd, setSlippage }) {
	let slippageUSD = amountUsd * (slippage / 100);
	return (
		<Box display="flex" flexDir="column" marginX="4px">
			<Text as="span" fontWeight="bold" fontSize="1rem" marginBottom="4px">
				Swap Slippage
			</Text>
			
			<Box display="flex" gap="6px" flexWrap="wrap" width="100%">
				<Box pos="relative" isolation="isolate">
					<input
						value={slippage}
						type="number"
						style={{
							width: '10ch',
							height: '2rem',
							padding: '4px 6px',
							background: 'rgba(0,0,0,.4)',
							marginLeft: 'auto',
							borderRadius: '0.375rem',
							fontSize: '0.875rem'
						}}
						placeholder="Custom"
						onChange={(val) => {
							setSlippage(val.target.value);
						}}
					/>
					<Text pos="absolute" top="6px" right="6px" fontSize="0.875rem" zIndex={1}>
						%
					</Text>
				</Box>
				<Text fontWeight="400" display="flex" justifyContent="flex-start" alignItems="center" gap="6px"fontSize="0.875rem">
				{amountUsd * (slippage / 100) ? (
						<Text display="inline" as="span" color={slippageUSD > 50 ? 'red.500' : 'gray.400'} fontWeight="500">
							{' '}
							≈ ${slippageUSD.toFixed(2)}
						</Text>
					) : ''}
				</Text>
			</Box>
			<Box display="flex" marginTop="4px" gap="6px" flexWrap="wrap" width="100%">
				{['0.1', '0.5', '1'].map((slippage) => (
					<Button
						fontSize="0.875rem"
						fontWeight="500"
						px="8px"
						bg="#38393e"
						height="1.5rem"
						onClick={() => {
							setSlippage(slippage);
						}}
						key={'slippage-btn' + slippage}
					>
						{slippage}%
					</Button>
				))}
			</Box>
		</Box>
	);
}
