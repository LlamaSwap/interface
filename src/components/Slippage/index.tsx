import { Button, Box, Text, Alert, AlertIcon } from '@chakra-ui/react';

const stablecoins = [
	'USDT',
	'USDC',
	'BUSD',
	'DAI',
	'FRAX',
	'TUSD',
	'USDD',
	'USDP',
	'GUSD',
	'LUSD',
	'sUSD',
	'MIM',
	'DOLA',
	'USP',
	'USDX',
	'MAI'
];

export function Slippage({ slippage, setSlippage, fromToken, toToken }) {
	if (Number.isNaN(slippage)) {
		throw new Error('Wrong slippage!');
	}
	return (
		<Box display="flex" flexDir="column" marginX="4px">
			{!!slippage && slippage > 1 ? (
				<Alert status="warning" borderRadius="0.375rem" py="8px">
					<AlertIcon />
					High slippage! You might get sandwiched with a slippage of {slippage}%
				</Alert>
			) : null}
			{!!slippage && slippage > 0.1 && stablecoins.includes(fromToken) && stablecoins.includes(toToken) ? (
				<Alert status="warning" borderRadius="0.375rem" py="8px">
					<AlertIcon />
					You are trading stablecoins but your slippage is very high, we recommend setting it to 0.1% or lower
				</Alert>
			) : null}
			<Text fontWeight="400" display="flex" justifyContent="space-between" alignItems="center" fontSize="0.875rem">
				Swap Slippage: {slippage && !Number.isNaN(Number(slippage)) ? Number(slippage) + '%' : ''}
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
						type="text"
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
							setSlippage(val.target.value.replace(/[^0-9.,]/g, '')?.replace(/,/g, '.'));
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
