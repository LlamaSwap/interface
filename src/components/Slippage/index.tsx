import { Button, Box, Text } from '@chakra-ui/react';

export function Slippage({ slippage, setSlippage }) {
	return (
		<Box display="flex" flexDir="column" marginX="4px">
			<Text fontWeight="400" display="flex" justifyContent="space-between" alignItems="center" fontSize="0.875rem">
				Swap Slippage: {slippage ? slippage + '%' : ''}
			</Text>
			<Box display="flex" gap="6px" flexWrap="wrap" width="100%">
				{['0.1', '0.5', '1'].map((slippage) => (
					<Button
						fontSize="0.875rem"
						fontWeight="500"
						p="8px"
						bg="#38393e"
						height="2rem"
						onClick={() => {
							setSlippage(slippage);
						}}
						key={'slippage-btn' + slippage}
					>
						{slippage}%
					</Button>
				))}
				<Box pos="relative" isolation="isolate">
					<input
						value={slippage}
						type="number"
						style={{
							width: '100%',
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
			</Box>
		</Box>
	);
}
