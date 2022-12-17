import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAccount, useBalance, useFeeData, useNetwork, useSigner, useSwitchNetwork } from 'wagmi';
import { groupBy, mapValues, merge, uniqBy } from 'lodash';
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';
import { ArrowRight } from 'react-feather';
import styled from 'styled-components';
import {
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalHeader,
	ModalOverlay,
	Image,
	Link,
	ModalFooter,
	Heading,
	useToast,
	Button,
	Alert,
	AlertIcon,
	FormControl,
	FormLabel,
	Switch,
	Flex,
	Box,
	Spacer
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import txImg from '~/public/llamanote.png';
import { TYPE } from '~/Theme';
import ReactSelect from '~/components/MultiSelect';
import FAQs from '~/components/FAQs';
import Route from '~/components/SwapRoute';
import { getAllChains, swap } from './router';
import { Input, TokenInput } from './TokenInput';
import { CrossIcon } from './Icons';
import Loader from './Loader';
import Search from './Search';
import { useTokenApprove } from './hooks';
import useGetRoutes from '~/queries/useGetRoutes';
import useGetPrice from '~/queries/useGetPrice';
import { nativeTokens } from './nativeTokens';
import { chainsMap, nativeAddress } from './constants';
import TokenSelect from './TokenSelect';
import { getSavedTokens } from '~/utils';
import useTokenBalances from '~/queries/useTokenBalances';
import Tooltip from '../Tooltip';

/*
Integrated:
- paraswap
- 0x
- 1inch
- cowswap
- kyberswap
- firebird (https://docs.firebird.finance/developer/api-specification)
- https://openocean.finance/
- airswap
- https://app.unidex.exchange/trading
- https://twitter.com/odosprotocol
- yieldyak
- https://defi.krystal.app/

- rook
- https://rubic.exchange/ - aggregates aggregators
- https://twitter.com/RangoExchange - api key requested, bridge aggregator, aggregates aggregators on same chain
- thorswap - aggregates aggregators that we already have
- lifi
- https://twitter.com/ChainHopDEX - only has 1inch
- https://twitter.com/MayanFinance

no api:
- https://twitter.com/HeraAggregator (no api)
- slingshot (no api)
- orion protocol
- autofarm.network/swap/
- https://swapr.eth.limo/#/swap?chainId=1 - aggregates aggregators + swapr

non evm:
- jupiter (solana)
- openocean (solana)
- https://twitter.com/prism_ag (solana)
- coinhall (terra)
- https://twitter.com/tfm_com (terra)

cant integrate:
- https://twitter.com/UniDexFinance - api broken (seems abandoned)
- https://bebop.xyz/ - not live
- VaporDex - not live
- https://twitter.com/hippolabs__ - not live
- dexguru - no api
- https://wowmax.exchange/alpha/ - still beta + no api
- https://twitter.com/RBXtoken - doesnt work
- https://www.bungee.exchange/ - couldnt use it
- wardenswap - no api + sdk is closed source
- https://twitter.com/DexibleApp - not an aggregator, only supports exotic orders like TWAP, segmented order, stop loss...
*/

const Body = styled.div<{ showRoutes: boolean }>`
	display: grid;
	grid-row-gap: 16px;
	padding-bottom: 4px;

	width: 100%;
	max-width: 30rem;

	box-shadow: ${({ theme }) =>
		theme.mode === 'dark'
			? '10px 0px 50px 10px rgba(26, 26, 26, 0.9);'
			: '10px 0px 50px 10px rgba(211, 211, 211, 0.9);;'};
	padding: 16px;
	border-radius: 16px;
	text-align: left;
	transition: all 0.66s ease-out;
	animation: ${(props) =>
		props.showRoutes === true ? 'slide-left 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) both' : 'none'};

	@keyframes slide-left {
		0% {
			transform: translateX(180px);
		}
		100% {
			transform: translateX(0);
		}
	}
`;

const Wrapper = styled.div`
	width: 100%;
	text-align: center;
	display: grid;
	grid-row-gap: 36px;
	margin: 10px auto 40px;
	position: relative;
	top: 36px;

	h1 {
		font-weight: 500;
	}

	@media screen and (min-width: ${({ theme }) => theme.bpMed}) {
		top: 0px;
	}
`;

const oneInchChains = {
	ethereum: 1,
	bsc: 56,
	polygon: 137,
	optimism: 10,
	arbitrum: 42161,
	avax: 43114,
	gnosis: 100,
	fantom: 250,
	klaytn: 8217
};

const Balance = styled.div`
	text-align: right;
	padding-right: 4px;
	text-decoration: underline;
	margin-top: 4px;
	cursor: pointer;
`;

const Routes = styled.div`
	padding: 16px;
	border-radius: 16px;
	text-align: left;
	overflow-y: scroll;
	min-width: 360px;
	max-height: 482px;
	min-width: 26rem;
	animation: tilt-in-fwd-in 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;

	box-shadow: ${({ theme }) =>
		theme.mode === 'dark'
			? '10px 0px 50px 10px rgba(26, 26, 26, 0.9);'
			: '10px 0px 50px 10px rgba(211, 211, 211, 0.9);'};

	&::-webkit-scrollbar {
		display: none;
	}

	-ms-overflow-style: none; /* IE and Edge */
	scrollbar-width: none; /* Firefox */

	@keyframes tilt-in-fwd-in {
		0% {
			transform: rotateY(-20deg) rotateX(35deg) translate(-300px, -300px) skew(35deg, -10deg);
			opacity: 0;
		}
		100% {
			transform: rotateY(0) rotateX(0deg) translate(0, 0) skew(0deg, 0deg);
			opacity: 1;
		}
	}

	@keyframes tilt-in-fwd-out {
		0% {
			transform: rotateY(-20deg) rotateX(35deg) translate(-1000px, -1000px) skew(35deg, -10deg);
			opacity: 0;
		}
		100% {
			transform: rotateY(0) rotateX(0deg) translate(0, 0) skew(0deg, 0deg);
			opacity: 1;
		}
	}
`;
const BodyWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;
	margin: 0 auto;

	@media screen and (min-width: ${({ theme }) => theme.bpLg}) {
		flex-direction: row;
	}
`;

const TokenSelectBody = styled.div`
	display: grid;
	grid-column-gap: 8px;
	margin-top: 16px;
	margin-bottom: 8px;
	grid-template-columns: 5fr 1fr 5fr;
`;

export const CloseBtn = ({ onClick }) => {
	return (
		<Close onClick={onClick}>
			<CrossIcon />
		</Close>
	);
};

export interface Token {
	address: string;
	logoURI: string;
	symbol: string;
	decimals: string;
	name: string;
	chainId: number;
	amount?: string;
	balanceUSD?: number;
}

export async function getTokenList() {
	const uniList = await fetch('https://tokens.uniswap.org/').then((r) => r.json());
	const sushiList = await fetch('https://token-list.sushi.com/').then((r) => r.json());
	const oneInch = await Promise.all(
		Object.values(oneInchChains).map(async (chainId) =>
			fetch(`https://tokens.1inch.io/v1.1/${chainId}`).then((r) => r.json())
		)
	);
	const hecoList = await fetch('https://token-list.sushi.com/').then((r) => r.json());
	const lifiList = await fetch('https://li.quest/v1/tokens').then((r) => r.json());

	const oneInchList = Object.values(oneInchChains)
		.map((chainId, i) =>
			Object.values(oneInch[i]).map((token: { address: string }) => ({
				...token,
				chainId
			}))
		)
		.flat();

	const tokensByChain = mapValues(
		merge(
			groupBy([...oneInchList, ...sushiList.tokens, ...uniList.tokens, ...hecoList.tokens, ...nativeTokens], 'chainId'),
			lifiList.tokens
		),
		(val) => uniqBy(val, (token: Token) => token.address.toLowerCase())
	);

	return {
		props: {
			tokenlist: tokensByChain
		},
		revalidate: 5 * 60 // 5 minutes
	};
}

const TransactionModal = ({ open, setOpen, link }) => {
	return (
		<Modal closeOnOverlayClick={true} isOpen={open} onClose={() => setOpen(false)}>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader textAlign={'center'}>Transaction submitted</ModalHeader>
				<ModalCloseButton />
				<ModalBody pb={6}>
					<Image src={txImg.src} alt="" />
				</ModalBody>
				<ModalFooter justifyContent={'center'}>
					<Link href={link} isExternal fontSize={'lg'} textAlign={'center'}>
						View in explorer <ExternalLinkIcon mx="2px" />
					</Link>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

const FormHeader = styled.div`
	font-weight: bold;
	font-size: 16px;
	margin-bottom: 4px;
	padding-left: 4px;
`;

const SelectWrapper = styled.div`
	border: ${({ theme }) => (theme.mode === 'dark' ? '2px solid #373944;' : '2px solid #c6cae0;')};
	border-radius: 16px;
	padding: 8px;
	padding-bottom: 16px;
`;

const Close = styled.span`
	position: absolute;
	right: 16px;
	cursor: pointer;
`;

const SwapWrapper = styled.div`
	width: 100%;
	display: flex;
	& > button {
		width: 100%;
		margin-right: 4px;
	}
`;

const InputFooter = styled.div`
	display: flex;
	justify-content: space-between;
`;

const chains = getAllChains();

export function AggregatorContainer({ tokenlist }) {
	const { data: signer } = useSigner();
	const { address } = useAccount();
	const { chain } = useNetwork();
	const [selectedChain, setSelectedChain] = useState(chains[0]);
	const [fromToken, setFromToken] = useState(null);
	const [toToken, setToToken] = useState(null);
	const [isPrivacyEnabled, setIsPrivacyEnabled] = useState(false);
	const toast = useToast();
	const savedTokens = getSavedTokens();
	const { data: tokenBalances } = useTokenBalances(address);

	const [slippage, setSlippage] = useState('1');

	const addRecentTransaction = useAddRecentTransaction();

	const { switchNetworkAsync } = useSwitchNetwork();

	const [amount, setAmount] = useState<number | string>('10');
	const [txModalOpen, setTxModalOpen] = useState(false);
	const [txUrl, setTxUrl] = useState('');

	const amountWithDecimals = BigNumber(amount)
		.times(10 ** (fromToken?.decimals || 18))
		.toFixed(0);

	const balance = useBalance({
		addressOrName: address,
		token: [ethers.constants.AddressZero, nativeAddress.toLowerCase()].includes(fromToken?.address?.toLowerCase())
			? undefined
			: fromToken?.address,
		watch: true
	});

	const currentChainId = chain?.id;

	const isValidSelectedChain = chains.find(
		({ value }) => selectedChain.value === value && chainsMap[value] === currentChainId
	);

	const cleanState = () => {
		setFromToken(null);
		setToToken(null);
		setRoute(null);
		setTxUrl('');
	};

	useEffect(() => {
		if (!isValidSelectedChain) {
			setSelectedChain(chains.find(({ value }) => chainsMap[value] === currentChainId) ?? chains[0]);
			cleanState();
		}
	}, [isValidSelectedChain, currentChainId]);

	useEffect(() => {
		const nativeToken = tokenlist[chainsMap[selectedChain.value]]?.[0] || {};
		setFromToken({
			...nativeToken,
			value: nativeToken.address,
			label: nativeToken.symbol
		});
	}, [selectedChain, tokenlist]);

	const { data: gasPriceData } = useFeeData({
		chainId: chainsMap[selectedChain.value]
	});

	const tokensInChain = tokenlist[chainsMap[selectedChain.value]]
		?.map((token) => ({
			...token,
			value: token.address,
			label: token.symbol
		}))
		.concat(savedTokens[chain?.id] || [])
		.map((token) => ({
			...token,
			amount: tokenBalances?.[chain?.id]?.[token.address.toLowerCase()]?.amount || 0,
			balanceUSD: tokenBalances?.[chain?.id]?.[token.address.toLowerCase()]?.balanceUSD || 0
		}))
		.sort((a, b) => b.balanceUSD - a.balanceUSD);

	const setTokens = (tokens) => {
		setFromToken(tokens.token0);
		setToToken(tokens.token1);
	};

	const [route, setRoute] = useState(null);

	const swapMutation = useMutation({
		mutationFn: (params: {
			chain: string;
			from: string;
			to: string;
			amount: string;
			adapter: string;
			signer: ethers.Signer;
			slippage: string;
			rawQuote: any;
			tokens: { toToken: Token; fromToken: Token };
		}) => swap(params),
		onSuccess: (data, variables) => {
			if (data.hash) {
				addRecentTransaction({
					hash: data.hash,
					description: `Swap transaction using ${variables.adapter} is sent.`
				});
				const explorerUrl = chain.blockExplorers.default.url;
				setTxModalOpen(true);

				setTxUrl(`${explorerUrl}/tx/${data.hash}`);
			} else {
				setTxModalOpen(true);
				setTxUrl(`https://explorer.cow.fi/orders/${data}`);
			}
		},
		onError: (err: { reason: string; code: string }) => {
			if (err.code !== 'ACTION_REJECTED')
				toast({
					title: 'Something went wrong.',
					description: err.reason,
					status: 'error',
					duration: 9000,
					isClosable: true,
					position: 'top'
				});
		}
	});

	const handleSwap = () => {
		swapMutation.mutate({
			chain: selectedChain.value,
			from: fromToken.value,
			to: toToken.value,
			amount: amountWithDecimals,
			signer,
			slippage,
			adapter: route.name,
			rawQuote: route?.price?.rawQuote,
			tokens: { fromToken, toToken }
		});
	};

	const { data: routes = [], isLoading } = useGetRoutes({
		chain: selectedChain.value,
		from: fromToken?.value,
		to: toToken?.value,
		amount: amountWithDecimals,
		extra: {
			gasPriceData,
			userAddress: address || ethers.constants.AddressZero,
			amount,
			fromToken,
			toToken,
			slippage,
			selectedRoute: route?.name,
			isPrivacyEnabled
		}
	});

	const { data: tokenPrices } = useGetPrice({
		chain: selectedChain.value,
		toToken: toToken?.address,
		fromToken: fromToken?.address
	});

	const { gasTokenPrice = 0, toTokenPrice = 0, fromTokenPrice = 0 } = tokenPrices || {};

	const {
		isApproved,
		approve,
		approveInfinite,
		isLoading: isApproveLoading
	} = useTokenApprove(fromToken?.address, route?.price?.tokenApprovalAddress, amountWithDecimals);

	const onMaxClick = () => {
		if (balance?.data?.formatted) {
			if (route && fromToken?.address === ethers.constants.AddressZero) {
				const gas = (+route.price.estimatedGas * +gasPriceData?.formatted?.gasPrice * 2) / 1e18;

				const amountWithoutGas = +balance?.data?.formatted - gas;
				setAmount(amountWithoutGas);
			} else {
				setAmount(balance?.data?.formatted);
			}
		}
	};

	const onChainChange = (newChain) => {
		if (switchNetworkAsync === undefined) {
			cleanState();
			setSelectedChain(newChain);
		} else {
			switchNetworkAsync(chainsMap[newChain.value]).then((chain) => {
				cleanState();
				setSelectedChain(chains.find(({ value }) => chainsMap[value] === chain?.id));
			});
		}
	};

	const normalizedRoutes = [...(routes || [])]
		?.map((route) => {
			const gasUsd = (gasTokenPrice * +route.price.estimatedGas * +gasPriceData?.formatted?.gasPrice) / 1e18 || 0;
			const amount = +route.price.amountReturned / 10 ** +toToken?.decimals;
			const amountUsd = (amount * toTokenPrice).toFixed(2);
			const netOut = +amountUsd - gasUsd;

			return { route, gasUsd, amountUsd, amount, netOut, ...route };
		})
		.filter(({ fromAmount, amount: toAmount }) => Number(toAmount) && amountWithDecimals === fromAmount)
		.sort((a, b) => b.netOut - a.netOut)
		.map((route, i, arr) => ({ ...route, lossPercent: route.netOut / arr[0].netOut }));
	const priceImpact =
		fromTokenPrice && route?.route?.amountUsd > 0
			? 100 - (route?.route?.amountUsd / (+fromTokenPrice * +amount)) * 100
			: 0;

	return (
		<Wrapper>
			<Heading>Meta-Aggregator</Heading>

			<TYPE.heading>
				This product is still WIP and not ready for public release yet. Please expect things to break and if you find
				anything broken please let us know in the{' '}
				<a style={{ textDecoration: 'underline' }} href="https://discord.defillama.com/">
					defillama discord
				</a>
			</TYPE.heading>

			<BodyWrapper>
				<Body showRoutes={fromToken && toToken}>
					<div>
						<FormHeader>
							<Flex>
								<Box>Chain</Box>
								<Spacer />
								<Tooltip content="Redirect requests through the DefiLlama Server to hide your IP address">
									<FormControl display="flex" justifyContent={'center'}>
										<FormLabel htmlFor="privacy-switch" pb="0" lineHeight={1}>
											Private mode
										</FormLabel>
										<Switch
											id="privacy-switch"
											onChange={(e) => setIsPrivacyEnabled(e?.target?.checked)}
											isChecked={isPrivacyEnabled}
										/>
									</FormControl>
								</Tooltip>
							</Flex>
						</FormHeader>
						<ReactSelect options={chains} value={selectedChain} onChange={onChainChange} />
					</div>

					<SelectWrapper>
						<FormHeader>Select Tokens</FormHeader>
						<TokenSelectBody>
							<TokenSelect tokens={tokensInChain} token={fromToken} onClick={setFromToken} />

							<div>
								<ArrowRight
									width={24}
									height={24}
									display="block"
									style={{
										marginTop: 8,
										marginLeft: 8,
										cursor: 'pointer'
									}}
									onClick={() => {
										setFromToken(toToken);
										setToToken(fromToken);
									}}
								/>
							</div>
							<TokenSelect tokens={tokensInChain} token={toToken} onClick={setToToken} />
						</TokenSelectBody>
						<div style={{ textAlign: 'center', margin: ' 8px 16px' }}>
							<TYPE.heading>OR</TYPE.heading>
						</div>
						<Search tokens={tokensInChain} setTokens={setTokens} />
					</SelectWrapper>

					<div>
						<FormHeader>Amount In</FormHeader>
						<TokenInput setAmount={setAmount} amount={amount} onMaxClick={onMaxClick} />
						<InputFooter>
							<div style={{ marginTop: 4, marginLeft: 4 }}>
								Slippage %{' '}
								<Input
									value={slippage}
									type="number"
									style={{
										width: 55,
										height: 30,
										display: 'inline',
										appearance: 'textfield'
									}}
									onChange={(val) => {
										if (+val.target.value < 50) setSlippage(val.target.value);
									}}
								/>{' '}
								{fromTokenPrice ? (
									<>
										Value: $
										{(+fromTokenPrice * +amount).toLocaleString(undefined, {
											maximumFractionDigits: 3
										})}
									</>
								) : null}
							</div>
							{balance.isSuccess ? (
								<Balance onClick={onMaxClick}>
									Balance:{' '}
									{(+balance?.data?.formatted).toLocaleString(undefined, {
										maximumFractionDigits: 3
									})}
								</Balance>
							) : null}
						</InputFooter>
					</div>
					<SwapWrapper>
						{route && address ? (
							<Button
								isLoading={swapMutation.isLoading || isApproveLoading}
								loadingText="Preparing transaction"
								colorScheme={'messenger'}
								onClick={() => {
									if (approve) approve();

									if (+amount > +balance?.data?.formatted) return;
									if (isApproved) handleSwap();
								}}
							>
								{isApproved ? 'Swap' : 'Approve'}
							</Button>
						) : null}
						{route && address && !isApproved && ['Matcha/0x', '1inch', 'CowSwap'].includes(route?.name) ? (
							<Button
								colorScheme={'messenger'}
								loadingText="Preparing transaction"
								isLoading={isApproveLoading}
								onClick={() => {
									if (approveInfinite) approveInfinite();
								}}
							>
								{'Approve Infinite'}
							</Button>
						) : null}
					</SwapWrapper>
					{priceImpact > 15 ? (
						<Alert status="warning">
							<AlertIcon />
							High price impact! More than {priceImpact.toFixed(2)}% drop.
						</Alert>
					) : null}
				</Body>

				{fromToken && toToken && (
					<Routes>
						<FormHeader>
							Routes
							<CloseBtn onClick={cleanState} />{' '}
						</FormHeader>

						{isLoading ? <Loader loaded={!isLoading} /> : null}

						{normalizedRoutes.map((r, i) => (
							<Route
								{...r}
								index={i}
								selected={route?.name === r.name}
								setRoute={() => setRoute({ ...r.route, route: r })}
								toToken={toToken}
								amountFrom={amountWithDecimals}
								fromToken={fromToken}
								selectedChain={selectedChain.label}
								gasTokenPrice={gasTokenPrice}
								key={i}
							/>
						))}
					</Routes>
				)}
			</BodyWrapper>

			<FAQs />
			<TransactionModal open={txModalOpen} setOpen={setTxModalOpen} link={txUrl} />
		</Wrapper>
	);
}
