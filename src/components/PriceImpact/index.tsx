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
import BigNumber from 'bignumber.js';
import { useState } from 'react';
import { PRICE_IMPACT_WARNING_THRESHOLD } from '../Aggregator/constants';

const PRICE_IMPACT_SMOL_WARNING_THRESHOLD = 3;

interface IPriceImpact {
	isLoading: boolean;
	fromToken?: { symbol: string; decimals: number; name: string } | null;
	toToken?: { symbol: string; decimals: number; name: string } | null;
	amount?: string | number;
	fromTokenPrice?: number;
	toTokenPrice?: number;
	selectedRoutesPriceImpact?: number;
	amountReturnedInSelectedRoute?: string;
	slippage?: string;
}

const NoPriceImpactAlert = ({ tokens }) => {
	return (
		<Alert status="warning" borderRadius="0.375rem" py="8px">
			<AlertIcon />
			{`Couldn't fetch price for ${tokens.join(
				', '
			)}, we aren't able to check price impact so please exercise caution. Please be very careful when checking the swap cause you could lose money`}
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
	amountReturnedInSelectedRoute,
	selectedRoutesPriceImpact,
	slippage
}: IPriceImpact) {
	const [priceOrder, setPriceOrder] = useState(1);
	if (isLoading || !fromToken || !toToken) {
		return null;
	}

	const tokensWithoutPrice = [
		!fromTokenPrice || Number.isNaN(Number(fromTokenPrice)) ? fromToken.symbol : null,
		!toTokenPrice || Number.isNaN(Number(toTokenPrice)) ? toToken.symbol : null
	].filter(Boolean);

	if (tokensWithoutPrice.length > 0) return <NoPriceImpactAlert tokens={tokensWithoutPrice} />;

	if (!amount || Number.isNaN(Number(amount)) || !amountReturnedInSelectedRoute) {
		return null;
	}

	const totalAmountReceived = BigNumber(amountReturnedInSelectedRoute).div(10 ** +toToken.decimals);

	const amountReceived = BigNumber(totalAmountReceived).div(amount);

	const toTokenValue = BigNumber(1).div(amountReceived);

	const minimumReceived =
		totalAmountReceived && !Number.isNaN(Number(totalAmountReceived))
			? BigNumber(totalAmountReceived).minus(BigNumber(totalAmountReceived).div(100).multipliedBy(slippage))
			: null;

	const isPriceImpactNotKnown = !selectedRoutesPriceImpact && selectedRoutesPriceImpact !== 0;
	const shouldRevertPriceOrder = fromToken && toTokenPrice && fromTokenPrice / toTokenPrice < 0.0001 ? 1 : 0;

	return (
		<>
			<Accordion allowToggle style={{ margin: '0 4px' }} index={[0]}>
				<AccordionItem borderColor="#373944" minH="2.5rem">
					<AccordionButton onClick={() => setPriceOrder((prev) => prev * -1)}>
						{priceOrder + shouldRevertPriceOrder === 1 ? (
							<Box as="span" flex="1" textAlign="left" fontSize="0.875rem">{`1 ${
								fromToken.symbol
							} = ${amountReceived.toFixed(4)} ${toToken.symbol} ($${(
								Number(amountReceived) * Number(toTokenPrice)
							).toFixed(2)})`}</Box>
						) : (
							<Box as="span" flex="1" textAlign="left" fontSize="0.875rem">{`1 ${
								toToken.symbol
							} = ${toTokenValue.toFixed(4)} ${fromToken.symbol} ($${(
								Number(toTokenValue) * Number(fromTokenPrice)
							).toFixed(2)})`}</Box>
						)}
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
							<span>{totalAmountReceived ? `${totalAmountReceived.toFixed(4)} ${toToken.symbol}` : '-'}</span>
						</Text>
						<Text
							display="flex"
							justifyContent="space-between"
							gap="8px"
							alignItems="center"
							color={
								isPriceImpactNotKnown
									? 'red.500'
									: selectedRoutesPriceImpact >= PRICE_IMPACT_SMOL_WARNING_THRESHOLD
									? 'orange.500'
									: 'white'
							}
						>
							<span>Price impact according to CoinGecko</span>

							{isPriceImpactNotKnown || selectedRoutesPriceImpact >= PRICE_IMPACT_SMOL_WARNING_THRESHOLD ? (
								<WarningTwoIcon style={{ marginLeft: 'auto' }} />
							) : null}

							<span>{isPriceImpactNotKnown ? 'Unknown' : `${selectedRoutesPriceImpact.toFixed(2)}%`}</span>
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

			{!isLoading && !isPriceImpactNotKnown && selectedRoutesPriceImpact >= PRICE_IMPACT_WARNING_THRESHOLD ? (
				<Alert status="warning" borderRadius="0.375rem" py="8px">
					<AlertIcon />
					High price impact! More than {selectedRoutesPriceImpact.toFixed(2)}% drop.
				</Alert>
			) : null}
			{!isLoading && toTokenPrice && Number(totalAmountReceived) * toTokenPrice > 100e3 ? (
				<Alert status="warning" borderRadius="0.375rem" py="8px">
					<AlertIcon />
					Your size is size. Please be mindful of slippage
				</Alert>
			) : null}
		</>
	);
}
