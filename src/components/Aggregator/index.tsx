import { useMemo, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAccount, useBalance, useFeeData, useNetwork, useSigner, useSwitchNetwork, useToken } from 'wagmi';
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit';
import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';
import { ArrowRight } from 'react-feather';
import styled from 'styled-components';
import {
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
	Spacer,
	IconButton,
	Text,
	ToastId
} from '@chakra-ui/react';
import ReactSelect from '~/components/MultiSelect';
import FAQs from '~/components/FAQs';
import Route from '~/components/SwapRoute';
import { getAllChains, swap } from './router';
import { Input, TokenInput } from './TokenInput';
import Loader from './Loader';
import Search from './Search';
import { useTokenApprove } from './hooks';
import { useGetRoutes } from '~/queries/useGetRoutes';
import { useGetPrice } from '~/queries/useGetPrice';
import { useTokenBalances } from '~/queries/useTokenBalances';
import { chainsMap, nativeAddress } from './constants';
import TokenSelect from './TokenSelect';
import { getSavedTokens } from '~/utils';
import Tooltip from '../Tooltip';
import type { IToken } from '~/types';
import { sendSwapEvent } from './adapters/utils';
import { useRouter } from 'next/router';
import { CloseBtn } from '../CloseBtn';
import { TransactionModal } from '../TransactionModal';

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
	const { address, isConnected } = useAccount();
	const { chain: chainOnWallet } = useNetwork();

	const [isPrivacyEnabled, setIsPrivacyEnabled] = useState(false);
	const toast = useToast();
	const savedTokens = getSavedTokens();
	const { data: tokenBalances } = useTokenBalances(address);

	const [slippage, setSlippage] = useState('1');

	const addRecentTransaction = useAddRecentTransaction();

	const { switchNetwork } = useSwitchNetwork();

	const router = useRouter();

	const { chain: chainOnURL, from: fromToken, to: toToken } = router.query;

	const chainName = typeof chainOnURL === 'string' ? chainOnURL.toLowerCase() : 'ethereum';
	const fromTokenSymbol = typeof fromToken === 'string' ? fromToken.toLowerCase() : null;
	const toTokenSymbol = typeof toToken === 'string' ? toToken.toLowerCase() : null;

	const { selectedChain, selectedFromToken, selectedToToken, chainTokenList } = useMemo(() => {
		const tokenList: Array<IToken> = tokenlist && chainName ? tokenlist[chainsMap[chainName]] || [] : null;

		const selectedChain = chains.find((c) => c.value === chainName);

		const selectedFromToken = tokenList?.find(
			(t) => t.symbol.toLowerCase() === fromTokenSymbol || t.address.toLowerCase() === fromTokenSymbol
		);

		const selectedToToken = tokenList?.find(
			(t) => t.symbol.toLowerCase() === toTokenSymbol || t.address.toLowerCase() === toTokenSymbol
		);

		return {
			selectedChain: selectedChain ? { ...selectedChain, id: chainsMap[selectedChain.value] } : null,
			selectedFromToken: selectedFromToken
				? { ...selectedFromToken, label: selectedFromToken.symbol, value: selectedFromToken.address }
				: null,
			selectedToToken: selectedToToken
				? { ...selectedToToken, label: selectedToToken.symbol, value: selectedToToken.address }
				: null,
			chainTokenList: tokenList
		};
	}, [chainName, fromTokenSymbol, toTokenSymbol, tokenlist]);

	const { data: fromToken2 } = useToken({
		address: fromToken as `0x${string}`,
		chainId: selectedChain.id,
		enabled: typeof fromToken === 'string' && fromToken.length === 42 && selectedChain ? true : false
	});

	const { data: toToken2 } = useToken({
		address: toToken as `0x${string}`,
		chainId: selectedChain.id,
		enabled: typeof toToken === 'string' && toToken.length === 42 && selectedChain ? true : false
	});

	const finalSelectedFromToken =
		!selectedFromToken && fromToken2
			? {
					name: fromToken2.name || fromToken2.address.slice(0, 4) + '...' + fromToken2.address.slice(-4),
					label: fromToken2.symbol || fromToken2.address.slice(0, 4) + '...' + fromToken2.address.slice(-4),
					symbol: fromToken2.symbol || '',
					address: fromToken2.address,
					value: fromToken2.address,
					decimals: fromToken2.decimals,
					logoURI: '',
					chainId: selectedChain.id ?? 1,
					geckoId: null
			  }
			: selectedFromToken;

	const finalSelectedToToken =
		!selectedToToken && toToken2
			? {
					name: toToken2.name || toToken2.address.slice(0, 4) + '...' + toToken2.address.slice(-4),
					label: toToken2.symbol || toToken2.address.slice(0, 4) + '...' + toToken2.address.slice(-4),
					symbol: toToken2.symbol || '',
					address: toToken2.address,
					value: toToken2.address,
					decimals: toToken2.decimals,
					logoURI: '',
					chainId: selectedChain.id ?? 1,
					geckoId: null
			  }
			: selectedToToken;

	const [amount, setAmount] = useState<number | string>('10');
	const [txModalOpen, setTxModalOpen] = useState(false);
	const [txUrl, setTxUrl] = useState('');

	const amountWithDecimals = BigNumber(amount)
		.times(BigNumber(10).pow(finalSelectedFromToken?.decimals || 18))
		.toFixed(0);

	const isValidSelectedChain = selectedChain && chainOnWallet ? selectedChain.id === chainOnWallet.id : false;

	const balance = useBalance({
		addressOrName: address,
		token: [ethers.constants.AddressZero, nativeAddress.toLowerCase()].includes(
			finalSelectedFromToken?.address?.toLowerCase()
		)
			? undefined
			: (finalSelectedFromToken?.address as `0x${string}`),
		watch: true,
		enabled: isValidSelectedChain
	});

	const { data: gasPriceData } = useFeeData({
		chainId: selectedChain?.id,
		enabled: selectedChain ? true : false
	});

	const tokensInChain =
		chainTokenList
			?.concat(savedTokens[chainOnWallet?.id] || [])
			.map((token) => ({
				...token,
				amount: tokenBalances?.[chainOnWallet?.id]?.[token.address.toLowerCase()]?.amount || 0,
				balanceUSD: tokenBalances?.[chainOnWallet?.id]?.[token.address.toLowerCase()]?.balanceUSD || 0
			}))
			.sort((a, b) => b.balanceUSD - a.balanceUSD) ?? [];

	const [route, setRoute] = useState(null);

	const confirmingTxToastRef = useRef<ToastId>();

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
			tokens: { toToken: IToken; fromToken: IToken };
		}) => swap(params),
		onSuccess: (data, variables) => {
			let txUrl;
			if (data.hash) {
				addRecentTransaction({
					hash: data.hash,
					description: `Swap transaction using ${variables.adapter} is sent.`
				});
				const explorerUrl = chainOnWallet.blockExplorers.default.url;
				setTxModalOpen(true);
				txUrl = `${explorerUrl}/tx/${data.hash}`;
				setTxUrl(txUrl);
			} else {
				setTxModalOpen(true);
				txUrl = `https://explorer.cow.fi/orders/${data}`;
				setTxUrl(txUrl);
			}

			confirmingTxToastRef.current = toast({
				title: 'Confirming Transaction',
				description: '',
				status: 'loading',
				isClosable: true,
				position: 'top-right'
			});

			data
				.wait?.()
				?.then((final) => {
					if (final.status === 1) {
						if (confirmingTxToastRef.current) {
							toast.close(confirmingTxToastRef.current);
						}

						const fromToken = variables.tokens.fromToken;
						const toToken = variables.tokens.toToken;

						const inAmount = variables.rawQuote?.inAmount ?? variables.rawQuote?.inputAmount;
						const outAmount = variables.rawQuote?.outAmount ?? variables.rawQuote?.outputAmount;

						toast({
							title: 'Transaction Success',
							description: `Swapped ${
								inAmount
									? BigNumber(inAmount)
											.div(10 ** Number(fromToken.decimals || 18))
											.toFixed(3)
									: ''
							} ${fromToken.symbol} for ${
								outAmount
									? BigNumber(outAmount)
											.div(10 ** Number(toToken.decimals || 18))
											.toFixed(3)
									: ''
							} ${toToken.symbol} via ${variables.adapter}`,
							status: 'success',
							duration: 10000,
							isClosable: true,
							position: 'top-right',
							containerStyle: {
								width: '100%',
								maxWidth: '300px'
							}
						});
					} else {
						toast({
							title: 'Transaction Failed',
							status: 'error',
							duration: 10000,
							isClosable: true,
							position: 'top-right',
							containerStyle: {
								width: '100%',
								maxWidth: '300px'
							}
						});
					}
				})
				.catch(() => {
					toast({
						title: 'Transaction Failed',
						status: 'error',
						duration: 10000,
						isClosable: true,
						position: 'top-right',
						containerStyle: {
							width: '100%',
							maxWidth: '300px'
						}
					});
				});

			sendSwapEvent({
				chain: selectedChain.value,
				user: address,
				from: variables.from,
				to: variables.to,
				aggregator: variables.adapter,
				isError: false,
				quote: variables.rawQuote,
				txUrl,
				amount: String(amount),
				errorData: {},
				amountUsd: +fromTokenPrice * +amount || 0
			});
		},
		onError: (err: { reason: string; code: string }, variables) => {
			if (err.code !== 'ACTION_REJECTED' || err.code.toString() === '-32603') {
				toast({
					title: 'Something went wrong.',
					description: err.reason,
					status: 'error',
					duration: 10000,
					isClosable: true,
					position: 'top-right',
					containerStyle: {
						width: '100%',
						maxWidth: '300px'
					}
				});

				sendSwapEvent({
					chain: selectedChain.value,
					user: address,
					from: variables.from,
					to: variables.to,
					aggregator: variables.adapter,
					isError: true,
					quote: variables.rawQuote,
					txUrl: '',
					amount: String(amount),
					errorData: err,
					amountUsd: fromTokenPrice * +amount || 0
				});
			}
		}
	});

	const handleSwap = () => {
		swapMutation.mutate({
			chain: selectedChain.value,
			from: finalSelectedFromToken.value,
			to: finalSelectedToToken.value,
			amount: amountWithDecimals,
			signer,
			slippage,
			adapter: route.name,
			rawQuote: route?.price?.rawQuote,
			tokens: { fromToken: finalSelectedFromToken, toToken: finalSelectedToToken }
		});
	};

	const { data: routes = [], isLoading } = useGetRoutes({
		chain: selectedChain?.value,
		from: finalSelectedFromToken?.value,
		to: finalSelectedToToken?.value,
		amount: amountWithDecimals,
		extra: {
			gasPriceData,
			userAddress: address || ethers.constants.AddressZero,
			amount,
			fromToken: finalSelectedFromToken,
			toToken: finalSelectedToToken,
			slippage,
			selectedRoute: route?.name,
			isPrivacyEnabled,
			setRoute
		}
	});

	const { data: tokenPrices } = useGetPrice({
		chain: selectedChain?.value,
		toToken: finalSelectedToToken?.address,
		fromToken: finalSelectedFromToken?.address
	});

	const { gasTokenPrice = 0, toTokenPrice = 0, fromTokenPrice = 0 } = tokenPrices || {};

	const {
		isApproved,
		approve,
		approveInfinite,
		isLoading: isApproveLoading,
		isInfiniteLoading: isApproveInfiniteLoading
	} = useTokenApprove(finalSelectedFromToken?.address, route?.price?.tokenApprovalAddress, amountWithDecimals);

	const onMaxClick = () => {
		if (balance?.data?.formatted) {
			if (route && finalSelectedFromToken?.address === ethers.constants.AddressZero) {
				const gas = (+route.price.estimatedGas * +gasPriceData?.formatted?.gasPrice * 2) / 1e18;

				const amountWithoutGas = +balance?.data?.formatted - gas;
				setAmount(amountWithoutGas);
			} else {
				setAmount(balance?.data?.formatted);
			}
		}
	};

	const onChainChange = (newChain) => {
		router.push({ pathname: '/', query: { chain: newChain.value } }, undefined, { shallow: true });
	};

	const onFromTokenChange = (token) => {
		router.push(
			{ pathname: router.pathname, query: { ...router.query, from: token.symbol || token.address } },
			undefined,
			{
				shallow: true
			}
		);
	};

	const onToTokenChange = (token) => {
		router.push(
			{ pathname: router.pathname, query: { ...router.query, to: token.symbol || token.address } },
			undefined,
			{
				shallow: true
			}
		);
	};

	const setTokens = (tokens) => {
		router.push(
			{ pathname: router.pathname, query: { ...router.query, from: tokens.token0.symbol, to: tokens.token1.symbol } },
			undefined,
			{
				shallow: true
			}
		);
	};

	let normalizedRoutes = [...(routes || [])]
		?.map((route) => {
			let gasUsd: number | string =
				(gasTokenPrice * +route.price.estimatedGas * +gasPriceData?.formatted?.gasPrice) / 1e18 || 0;

			// CowSwap native token swap
			gasUsd =
				route.price.feeAmount && finalSelectedFromToken.address === ethers.constants.AddressZero
					? (route.price.feeAmount / 1e18) * gasTokenPrice
					: gasUsd;

			gasUsd = route.l1Gas !== 'Unknown' && route.l1Gas ? route.l1Gas * gasTokenPrice + gasUsd : gasUsd;
			gasUsd = route.l1Gas === 'Unknown' ? 'Unknown' : gasUsd;
			const amount = +route.price.amountReturned / 10 ** +finalSelectedToToken?.decimals;
			const amountUsd = (amount * toTokenPrice).toFixed(2);
			const netOut = route.l1Gas !== 'Unknown' ? +amountUsd - +gasUsd : +amountUsd;

			return { route, gasUsd, amountUsd, amount, netOut, ...route };
		})
		.filter(({ fromAmount, amount: toAmount }) => Number(toAmount) && amountWithDecimals === fromAmount)
		.sort((a, b) => b.netOut - a.netOut)
		.map((route, i, arr) => ({ ...route, lossPercent: route.netOut / arr[0].netOut }));

	normalizedRoutes = normalizedRoutes
		.filter((r) => r.gasUsd !== 'Unknown')
		.concat(normalizedRoutes.filter((r) => r.gasUsd === 'Unknown'));

	const priceImpact =
		fromTokenPrice && route?.route?.amountUsd > 0
			? 100 - (route?.route?.amountUsd / (+fromTokenPrice * +amount)) * 100
			: 0;

	return (
		<Wrapper>
			<Heading>Meta-Aggregator</Heading>

			<Text fontSize="1rem" fontWeight="500">
				This product is still in beta. If you run into any issue please let us know in our{' '}
				<a style={{ textDecoration: 'underline' }} href="https://discord.gg/j54NuUt5nW">
					discord server
				</a>
			</Text>

			<BodyWrapper>
				<Body showRoutes={finalSelectedFromToken && finalSelectedToToken ? true : false}>
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
							<TokenSelect
								tokens={chainTokenList}
								token={finalSelectedFromToken}
								onClick={onFromTokenChange}
								selectedChain={selectedChain}
							/>

							<IconButton
								onClick={() =>
									router.push(
										{
											pathname: router.pathname,
											query: { ...router.query, to: fromToken, from: toToken }
										},
										undefined,
										{ shallow: true }
									)
								}
								bg="none"
								icon={<ArrowRight />}
								aria-label="Switch Tokens"
								marginTop="auto"
							/>

							<TokenSelect
								tokens={chainTokenList}
								token={finalSelectedToToken}
								onClick={onToTokenChange}
								selectedChain={selectedChain}
							/>
						</TokenSelectBody>

						{/* <Text textAlign="center" margin="8px 16px">
							OR
						</Text>

						<Search tokens={tokensInChain} setTokens={setTokens} /> */}
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
						{!isConnected ? (
							// <Button colorScheme={'messenger'} onClick={() => openConnectModal()}>
							// 	Connect Wallet
							// </Button>
							<></>
						) : !isValidSelectedChain ? (
							<Button colorScheme={'messenger'} onClick={() => switchNetwork(selectedChain.id)}>
								Switch Network
							</Button>
						) : (
							<>
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
										isLoading={isApproveInfiniteLoading}
										onClick={() => {
											if (approveInfinite) approveInfinite();
										}}
									>
										{'Approve Infinite'}
									</Button>
								) : null}
							</>
						)}
					</SwapWrapper>
					{priceImpact > 15 && !isLoading ? (
						<Alert status="warning">
							<AlertIcon />
							High price impact! More than {priceImpact.toFixed(2)}% drop.
						</Alert>
					) : null}
				</Body>

				{finalSelectedFromToken && finalSelectedToToken && (
					<Routes>
						<FormHeader>
							Routes
							<CloseBtn
								right="4px"
								top="6px"
								onClick={() => router.push({ pathname: '/' }, undefined, { shallow: true })}
							/>
						</FormHeader>

						{isLoading ? <Loader loaded={!isLoading} /> : null}

						{normalizedRoutes.map((r, i) => (
							<Route
								{...r}
								index={i}
								selected={route?.name === r.name}
								setRoute={() => setRoute({ ...r.route, route: r })}
								toToken={finalSelectedToToken}
								amountFrom={amountWithDecimals}
								fromToken={finalSelectedFromToken}
								selectedChain={selectedChain.label}
								gasTokenPrice={gasTokenPrice}
								key={
									selectedChain.label +
									finalSelectedFromToken.label +
									finalSelectedToToken.label +
									amountWithDecimals +
									gasPriceData.formatted.gasPrice +
									r.name
								}
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
