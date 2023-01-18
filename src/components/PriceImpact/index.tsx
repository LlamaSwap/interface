import { WarningTwoIcon } from '@chakra-ui/icons';
import {
	Accordion,
	AccordionButton,
	AccordionIcon,
	AccordionItem,
	AccordionPanel,
	Alert,
	AlertIcon,
	Box,
	Text
} from '@chakra-ui/react';
import { PRICE_IMPACT_WARNING_THRESHOLD } from '../Aggregator/constants';

interface IPriceImpact {
	isLoading: boolean;
	fromToken?: { symbol: string; decimals: number; name: string } | null;
	toToken?: { symbol: string; decimals: number; name: string } | null;
	amount?: string | number;
	fromTokenPrice?: number;
	toTokenPrice?: number;
	priceImpact?: number;
	priceImpactRoute: { amountUsd: string; amount: number; price: { amountReturned: string } };
	slippage?: string;
}

const NoPriceImpactAlert = ({ name: string }) => {
	return (
		<Alert status="warning" borderRadius="0.375rem" py="8px">
			<AlertIcon />
			{`Couldn't fetch price for ${string}, we aren't able to check price impact so please exercise caution`}
		</Alert>
	);
};

export function PriceImpact({
	isLoading,
	fromToken,
	toToken,
	fromTokenPrice,
	toTokenPrice,
	amount,
	priceImpactRoute,
	priceImpact,
	slippage
}: IPriceImpact) {
	if (isLoading || !fromToken || !toToken) {
		return null;
	}

	if (!fromTokenPrice || Number.isNaN(Number(fromTokenPrice))) {
		return <NoPriceImpactAlert name={fromToken.symbol} />;
	}

	if (!toTokenPrice || Number.isNaN(Number(toTokenPrice))) {
		return <NoPriceImpactAlert name={toToken.symbol} />;
	}

	if (!amount || Number.isNaN(Number(amount)) || !priceImpact || !priceImpactRoute) {
		return null;
	}

	const amountReceived = (
		Number(+priceImpactRoute.price.amountReturned / 10 ** +toToken.decimals) / Number(amount)
	).toFixed(4);

	const expectedOutput = ((+amount * fromTokenPrice) / toTokenPrice).toFixed(4);

	const totalAmountReceived = Number(+priceImpactRoute.price.amountReturned / 10 ** +toToken.decimals).toFixed(4);

	const minimumReceived =
		totalAmountReceived && !Number.isNaN(Number(totalAmountReceived))
			? Number(totalAmountReceived) - (Number(totalAmountReceived) / 100) * Number(slippage)
			: null;

	const isPriceImpactNotKnown = !priceImpact && priceImpact !== 0;

	return (
		<>
			<Accordion allowToggle style={{ margin: '0 4px' }}>
				<AccordionItem borderColor="#373944" minH="2.5rem">
					<AccordionButton>
						<Box as="span" flex="1" textAlign="left" fontSize="0.875rem">{`1 ${fromToken.symbol} = ${amountReceived} ${
							toToken.symbol
						} ($${(Number(amountReceived) * Number(toTokenPrice)).toFixed(2)})`}</Box>
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
							color={
								isPriceImpactNotKnown
									? 'red.500'
									: priceImpact >= PRICE_IMPACT_WARNING_THRESHOLD
									? 'orange.500'
									: 'white'
							}
						>
							<span>Price Impact</span>

							{isPriceImpactNotKnown || priceImpact >= PRICE_IMPACT_WARNING_THRESHOLD ? (
								<WarningTwoIcon style={{ marginLeft: 'auto' }} />
							) : null}

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

			{!isLoading && !isPriceImpactNotKnown && priceImpact >= PRICE_IMPACT_WARNING_THRESHOLD ? (
				<Alert status="warning" borderRadius="0.375rem" py="8px">
					<AlertIcon />
					High price impact! More than {priceImpact.toFixed(2)}% drop.
				</Alert>
			) : null}
		</>
	);
}
