import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box } from '@chakra-ui/react';
import { TYPE } from '~/Theme';

export default function FaqWrapper() {
	return (
		<>
			<TYPE.largeHeader>FAQ</TYPE.largeHeader>
			<Accordion allowMultiple margin={'0 auto'} width={600}>
				<AccordionItem>
					<h2>
						<AccordionButton>
							<Box flex="1" textAlign="left">
								What is this?
							</Box>
							<AccordionIcon />
						</AccordionButton>
					</h2>
					<AccordionPanel pb={4}>
						It's an aggregator of DEX aggregators, we query the price in 1inch, cowswap, matcha... and then offer you
						the best price among all of them
					</AccordionPanel>
				</AccordionItem>

				<AccordionItem>
					<h2>
						<AccordionButton>
							<Box flex="1" textAlign="left">
								Does DefiLlama take any fees?
							</Box>
							<AccordionIcon />
						</AccordionButton>
					</h2>
					<AccordionPanel pb={4}>
						DefiLlama takes 0 fee on swaps.
						<br />
						<br /> You'll get the exact same price swapping through DefiLlama as what you'd get swapping through the
						chosen aggregator directly.
						<br />
						<br />
						We do add our referral code to swaps tho, so, for aggregators with revenue sharing, they will send us part
						of the fee they earn. This is not an extra fee, you'd be charged the same fee anyway, but now a small part
						of it is shared with DefiLlama. We also integrate aggregators with no fee sharing the best price, and in
						those cases we don't make any money.
					</AccordionPanel>
				</AccordionItem>
				<AccordionItem>
					<h2>
						<AccordionButton>
							<Box flex="1" textAlign="left">
								Is it safe?
							</Box>
							<AccordionIcon />
						</AccordionButton>
					</h2>
					<AccordionPanel pb={4}>
						Our aggregator uses the router contract of each aggregator, we don't use any contracts developed by us. Thus
						you inherit the same security you'd get by swapping directly from their UI instead of ours.
					</AccordionPanel>
				</AccordionItem>
				<AccordionItem>
					<h2>
						<AccordionButton>
							<Box flex="1" textAlign="left">
								Will I be eligible for aggregator airdrops if I swap through DefiLlama?
							</Box>
							<AccordionIcon />
						</AccordionButton>
					</h2>
					<AccordionPanel pb={4}>
						Yes, we execute swaps directly against the router of each aggregator, so there's no difference between a
						swap executed directly from their UI and a swap executed from DefiLlama.
						<br />
						<br />
						Thus, if any of the aggregators we integrate does an airdrop in the future, all swaps made through them
						would be eligible for airdrops as swaps made through their UI.
					</AccordionPanel>
				</AccordionItem>
			</Accordion>
		</>
	);
}
