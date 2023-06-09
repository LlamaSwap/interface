import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Text } from '@chakra-ui/react';

export default function FaqWrapper() {
	return (
		<>
			<Text fontWeight={500} color={'#FAFAFA'} fontSize={24}>
				FAQ
			</Text>
			<Accordion allowMultiple margin={'0 auto'} style={{ width: '100%', maxWidth: '600px' }}>
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
								Why do gas fees in MetaMask not match what I see in the UI?
							</Box>
							<AccordionIcon />
						</AccordionButton>
					</h2>
					<AccordionPanel pb={4}>
						We inflate gas limit of txs on MetaMask by +40% to ensure that there's nothig unexpected that could trigger
						out-of-gas reverts. This stacks on top of any increase your RPC might apply on gas estimations, along with
						possible different gas prices between your metamask and our estimation.
						<br />
						<br />
						All this together means that gas number you see on metamask will always be inflated, while in our UI we
						display the actual gas that the tx will consume. The extra gas that is not used is just refunded to the user
						when tx executes.
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
						We execute swaps directly against the router of each aggregator, so there's no difference between a swap
						executed directly from their UI and a swap executed from DefiLlama.
						<br />
						<br />
						Thus, if any of the aggregators we integrate does an airdrop in the future, all swaps made through them
						would be eligible for their airdrop.
					</AccordionPanel>
				</AccordionItem>
				<AccordionItem>
					<h2>
						<AccordionButton>
							<Box flex="1" textAlign="left">
								I swapped ETH on CowSwap but it just disappeared, what happened?
							</Box>
							<AccordionIcon />
						</AccordionButton>
					</h2>
					<AccordionPanel pb={4}>
						Some ETH orders on CowSwap might not get filled because price moves against you too quickly, in those cases
						the ETH just sits in a contract until it is refunded 30 minutes after your tx.
					</AccordionPanel>
				</AccordionItem>
			</Accordion>
		</>
	);
}
