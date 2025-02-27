import { WarningIcon } from '@chakra-ui/icons';
import { Button, Box, Text, Alert, AlertIcon, Popover, PopoverTrigger, PopoverContent } from '@chakra-ui/react';
import * as React from 'react';

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
	'FPI',
	'MIM',
	'DOLA',
	'USP',
	'USDX',
	'MAI',
	'EURS',
	'EURT',
	'alUSD',
	'PAX'
];

export function Slippage({ slippage, setSlippage, fromToken, toToken }) {
	if (Number.isNaN(slippage)) {
		throw new Error('Wrong slippage!');
	}

	const warnings = [
		!!slippage && slippage > 1 ? (
			<Alert status="warning" borderRadius="0.375rem" py="8px">
				<AlertIcon />
				High slippage! You might get sandwiched with a slippage of {slippage}%
			</Alert>
		) : null,
		!!slippage && slippage > 0.05 && stablecoins.includes(fromToken) && stablecoins.includes(toToken) ? (
			<Alert status="warning" borderRadius="0.375rem" py="8px" mt="2">
				<AlertIcon />
				You are trading stablecoins but your slippage is very high, we recommend setting it to 0.05% or lower
			</Alert>
		) : null,
		!!slippage && (!stablecoins.includes(fromToken) || !stablecoins.includes(toToken)) && slippage < 0.05 ? (
			<Alert status="warning" borderRadius="0.375rem" py="8px" mt="2">
				<AlertIcon />
				Slippage is low, tx is likely to revert
			</Alert>
		) : null
	].filter(Boolean);
	return (
		<Box display="flex" flexDir="column" marginX="4px">
			<Box display={['none', 'none', 'block', 'block']}>
				{warnings.map((warning, i) => (
					<React.Fragment key={`warning-${i}`}>{warning}</React.Fragment>
				))}
			</Box>
			<Text fontWeight="400" display="flex" justifyContent="space-between" alignItems="center" fontSize="0.875rem">
				Slippage (%)
			</Text>
			<Box display="flex" gap="6px" flexWrap="wrap" width="100%">
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
						fontSize: '0.875rem',
						borderColor: warnings.length ? 'rgb(224, 148, 17)' : undefined,
						borderWidth: warnings.length ? '1px' : undefined,
						flex: 1
					}}
					placeholder="Custom"
					onChange={(val) => {
						setSlippage(val.target.value.replace(/[^0-9.,]/g, '')?.replace(/,/g, '.'));
					}}
				/>
				{warnings.length ? (
					<Popover>
						<PopoverTrigger>
							<WarningIcon color={'rgb(224, 148, 17)'} height="20px" width="20px" mt="6px" />
						</PopoverTrigger>
						<PopoverContent>
							{warnings.map((warning, i) => (
								<React.Fragment key={`warning-2-${i}`}>{warning}</React.Fragment>
							))}
						</PopoverContent>
					</Popover>
				) : null}
				{['0.05', '0.1', '0.5', '1'].map((slp) => (
					<Button
						fontSize="0.875rem"
						fontWeight="500"
						p="8px"
						bg={slippage === slp ? "#2172E5" : "#38393e"}
						height="2rem"
						onClick={() => {
							setSlippage(slp);
						}}
						key={'slp-btn' + slp}
					>
						{slp}
					</Button>
				))}
			</Box>
		</Box>
	);
}
