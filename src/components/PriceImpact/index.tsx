import { WarningTwoIcon } from '@chakra-ui/icons';
import {
	Accordion,
	AccordionButton,
	AccordionIcon,
	AccordionItem,
	AccordionPanel,
	Box,
	Skeleton,
	Text
} from '@chakra-ui/react';
import { useQueryParams } from '~/hooks/useQueryParams';

interface IPriceImpact {
	isLoading: boolean;
	fromToken?: { symbol: string; decimals: number } | null;
	toToken?: { symbol: string; decimals: number } | null;
	fromTokenPrice?: number;
	toTokenPrice?: number;
	amount?: string | number | null;
	priceImpact?: number;
	priceImpactRoute: { amountUsd: string; amount: number };
}

export function PriceImpact({
	isLoading,
	fromToken,
	toToken,
	fromTokenPrice,
	toTokenPrice,
	amount,
	priceImpactRoute,
	priceImpact
}: IPriceImpact) {
	const { slippage } = useQueryParams();

	if (isLoading) {
		return (
			<Box h="2.5rem" display="flex" alignItems="center" borderY="1px solid #373944">
				<Skeleton h="16px" width="30%" />
			</Box>
		);
	}

	if (
		!fromToken ||
		!toToken ||
		!fromTokenPrice ||
		!toTokenPrice ||
		Number.isNaN(Number(fromTokenPrice)) ||
		Number.isNaN(Number(toTokenPrice))
	) {
		return <Box h="2.5rem" display="flex" alignItems="center" borderY="1px solid #373944"></Box>;
	}

	const fromTokenValue = (fromTokenPrice / toTokenPrice).toFixed(4);
	const expectedOutput =
		priceImpactRoute && !Number.isNaN(Number(priceImpactRoute.amount))
			? Number(priceImpactRoute.amount).toFixed(4)
			: null;
	const minimumReceived =
		priceImpactRoute && !Number.isNaN(Number(priceImpactRoute.amount))
			? Number(priceImpactRoute.amount) - (Number(priceImpactRoute.amount) / 100) * Number(slippage)
			: null;

	const isPriceImpactNotKnown = !priceImpact && priceImpact !== 0;

	return (
		<Accordion allowToggle style={{ margin: '0 4px' }}>
			<AccordionItem borderColor="#373944" minH="2.5rem">
				<AccordionButton>
					<Box as="span" flex="1" textAlign="left" fontSize="0.875rem">{`1 ${fromToken.symbol} = ${Number(
						fromTokenValue
					).toFixed(4)} ${toToken.symbol} ($${(+fromTokenPrice).toFixed(2)})`}</Box>
					<AccordionIcon />
				</AccordionButton>

				<AccordionPanel
					px={4}
					py={2}
					mb={2}
					display="flex"
					flexDir="column"
					gap={2}
					border="1px solid #373944"
					borderRadius="0.375rem"
					fontSize="0.875rem"
				>
					<Text display="flex" justifyContent="space-between" gap="8px" alignItems="center">
						<span>Expected Output</span>
						<span>{expectedOutput ? `${expectedOutput} ${toToken.symbol}` : '-'}</span>
					</Text>
					<Text
						display="flex"
						justifyContent="space-between"
						gap="8px"
						alignItems="center"
						color={isPriceImpactNotKnown ? 'red.500' : priceImpact >= 7 ? 'orange.500' : 'white'}
					>
						<span>Price Impact</span>

						{isPriceImpactNotKnown || priceImpact >= 7 ? <WarningTwoIcon style={{ marginLeft: 'auto' }} /> : null}

						<span>{isPriceImpactNotKnown ? 'Unknown' : `${priceImpact.toFixed(2)}%`}</span>
					</Text>
					<Text
						display="flex"
						justifyContent="space-between"
						gap="8px"
						alignItems="center"
						borderTop="1px solid #373944"
						paddingTop={2}
						color={minimumReceived !== null && Number(minimumReceived) <= 0 ? 'red.500' : 'white'}
					>
						<span>{`Minimum received after slippage (${slippage}%)`}</span>
						<span>
							{minimumReceived === null
								? '-'
								: `${Number(minimumReceived) <= 0 ? 0 : minimumReceived.toFixed(4)} ${toToken.symbol}`}
						</span>
					</Text>
				</AccordionPanel>
			</AccordionItem>
		</Accordion>
	);
}
