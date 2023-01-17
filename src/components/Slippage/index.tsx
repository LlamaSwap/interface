import { Button, Box, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useQueryParams } from '~/hooks/useQueryParams';

export function Slippage() {
	const [customSlippage, setCustomSlippage] = useState<string | number>('');

	const router = useRouter();

	const { slippage } = useQueryParams();

	useEffect(() => {
		const id = setTimeout(() => {
			if (customSlippage && !Number.isNaN(Number(customSlippage)) && slippage !== customSlippage) {
				router.push({ pathname: '/', query: { ...router.query, slippage: customSlippage } }, undefined, {
					shallow: true
				});
			}
		}, 300);

		return () => clearTimeout(id);
	}, [slippage, customSlippage, router]);

	return (
		<Box display="flex" flexDir="column" marginX="4px">
			<Text fontWeight="400" display="flex" justifyContent="space-between" alignItems="center" fontSize="0.875rem">
				Swap Slippage: {slippage ? slippage + '%' : ''}
			</Text>
			<Box display="flex" gap="6px" flexWrap="wrap" width="100%">
				<Button
					fontSize="0.875rem"
					fontWeight="500"
					p="8px"
					bg="#38393e"
					height="2rem"
					onClick={() => {
						setCustomSlippage('');
						router.push({ pathname: '/', query: { ...router.query, slippage: '0.1' } }, undefined, {
							shallow: true
						});
					}}
				>
					0.1%
				</Button>
				<Button
					fontSize="0.875rem"
					fontWeight="500"
					p="8px"
					bg="#38393e"
					height="2rem"
					onClick={() => {
						setCustomSlippage('');

						router.push({ pathname: '/', query: { ...router.query, slippage: '0.5' } }, undefined, {
							shallow: true
						});
					}}
				>
					0.5%
				</Button>
				<Button
					fontSize="0.875rem"
					fontWeight="500"
					p="8px"
					bg="#38393e"
					height="2rem"
					onClick={() => {
						setCustomSlippage('');

						router.push({ pathname: '/', query: { ...router.query, slippage: '1' } }, undefined, {
							shallow: true
						});
					}}
				>
					1%
				</Button>
				<Box pos="relative" isolation="isolate">
					<input
						value={customSlippage}
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
							setCustomSlippage(val.target.value);
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
