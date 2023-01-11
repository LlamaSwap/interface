import { useEffect, useMemo, useRef, useState } from 'react';
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
import { TokenInput } from './TokenInput';
import Loader from './Loader';
import { useTokenApprove } from './hooks';
import { useGetRoutes } from '~/queries/useGetRoutes';
import { useGetPrice } from '~/queries/useGetPrice';
import { useTokenBalances } from '~/queries/useTokenBalances';
import { chainsMap, nativeAddress } from './constants';
import TokenSelect from './TokenSelect';
import Tooltip from '../Tooltip';
import type { IToken } from '~/types';
import { sendSwapEvent } from './adapters/utils';
import { useRouter } from 'next/router';
import { TransactionModal } from '../TransactionModal';
import { median } from '~/utils';
import RoutesPreview from './RoutesPreview';
import { formatSuccessToast } from '~/utils/formatSuccessToast';
import { useDebounce } from '~/hooks/useDebounce';
import { useGetSavedTokens } from '~/queries/useGetSavedTokens';

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
	display: flex;
	flex-direction: column;
	gap: 16px;
	padding: 16px;
	width: 100%;
	max-width: 30rem;

	box-shadow: ${({ theme }) =>
		theme.mode === 'dark'
			? '10px 0px 50px 10px rgba(26, 26, 26, 0.9);'
			: '10px 0px 50px 10px rgba(211, 211, 211, 0.9);;'};

	border-radius: 16px;
	text-align: left;
`;

const Wrapper = styled.div`
	width: 100%;
	height: 100%;
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

const Routes = styled.div`
	display: flex;
	flex-direction: column;
	padding: 16px;
	border-radius: 16px;
	text-align: left;
	overflow-y: scroll;
	width: 100%;
	height: 100%;
	max-height: 480px;
	max-width: 28.25rem;

	& > *:first-child {
		margin-bottom: -6px;
	}

	box-shadow: ${({ theme }) =>
		theme.mode === 'dark'
			? '10px 0px 50px 10px rgba(26, 26, 26, 0.9);'
			: '10px 0px 50px 10px rgba(211, 211, 211, 0.9);'};

	&::-webkit-scrollbar {
		display: none;
	}

	-ms-overflow-style: none; /* IE and Edge */
	scrollbar-width: none; /* Firefox */
`;

const BodyWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;
	width: 100%;
	min-height: 480px;

	& > * {
		flex: 1;
	}

	@media screen and (min-width: ${({ theme }) => theme.bpLg}) {
		flex-direction: row;
		justify-content: center;
	}
`;

const TokenSelectBody = styled.div`
	display: grid;
	grid-column-gap: 8px;
	grid-template-columns: 5fr 1fr 5fr;
`;

const FormHeader = styled.div`
	font-weight: bold;
	font-size: 16px;
	margin-bottom: 4px;
	margin-left: 4px;
`;

const SelectWrapper = styled.div`
	border: ${({ theme }) => (theme.mode === 'dark' ? '2px solid #373944;' : '2px solid #c6cae0;')};
	border-radius: 16px;
	padding: 12px;
	display: flex;
	flex-direction: column;
`;

const SwapWrapper = styled.div`
	margin-top: auto;
	min-height: 40px;
	width: 100%;
	display: flex;
	gap: 4px;
	flex-wrap: wrap;

	& > button {
		flex: 1;
	}
`;

const chains = getAllChains();

export function AggregatorContainer({ tokenlist }) {
	const { data: signer } = useSigner();
	const { address, isConnected } = useAccount();
	const { chain: chainOnWallet } = useNetwork();

	const [route, setRoute] = useState(null);

	const [isPrivacyEnabled, setIsPrivacyEnabled] = useState(false);
	const toast = useToast();

	const { data: tokenBalances } = useTokenBalances(address);

	const [customSlippage, setCustomSlippage] = useState<string | number>('');

	const addRecentTransaction = useAddRecentTransaction();

	const { switchNetwork } = useSwitchNetwork();

	const router = useRouter();

	const { chain: chainOnURL, from: fromToken, to: toToken, slippage: slippageQuery } = router.query;

	const chainName = typeof chainOnURL === 'string' ? chainOnURL.toLowerCase() : 'ethereum';
	const fromTokenAddress = typeof fromToken === 'string' ? fromToken.toLowerCase() : null;
	const toTokenAddress = typeof toToken === 'string' ? toToken.toLowerCase() : null;
	const slippage = typeof slippageQuery === 'string' && !Number.isNaN(Number(slippageQuery)) ? slippageQuery : '0.5';

	const { selectedChain, selectedFromToken, selectedToToken, chainTokenList } = useMemo(() => {
		const tokenList: Array<IToken> = tokenlist && chainName ? tokenlist[chainsMap[chainName]] || [] : null;

		const selectedChain = chains.find((c) => c.value === chainName);

		const selectedFromToken = tokenList?.find((t) => t.address.toLowerCase() === fromTokenAddress);

		const selectedToToken = tokenList?.find((t) => t.address.toLowerCase() === toTokenAddress);

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
	}, [chainName, fromTokenAddress, toTokenAddress, tokenlist]);

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

	const amountWithDecimals = BigNumber(amount && amount !== '' ? amount : '0')
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
		chainId: selectedChain.id,
		enabled: selectedChain && isConnected && finalSelectedFromToken ? true : false
	});

	const { data: gasPriceData } = useFeeData({
		chainId: selectedChain?.id,
		enabled: selectedChain ? true : false
	});

	const { data: savedTokens } = useGetSavedTokens(selectedChain?.id);

	const tokensInChain = useMemo(() => {
		return (
			chainTokenList
				?.concat(savedTokens)
				.map((token) => ({
					...token,
					amount:
						tokenBalances?.[selectedChain?.id]?.find((t) => t.address.toLowerCase() === token.address.toLowerCase())
							?.amount ?? 0,
					balanceUSD:
						tokenBalances?.[selectedChain?.id]?.find((t) => t.address.toLowerCase() === token.address.toLowerCase())
							?.balanceUSD ?? 0
				}))
				.sort((a, b) => b.balanceUSD - a.balanceUSD) ?? []
		);
	}, [chainTokenList, selectedChain?.id, tokenBalances, savedTokens]);

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
				txUrl = `https://explorer.cow.fi/orders/${data.id}`;
				setTxUrl(txUrl);
				data.waitForOrder(() => {
					toast(formatSuccessToast(variables));
				});
			}

			confirmingTxToastRef.current = toast({
				title: 'Confirming Transaction',
				description: '',
				status: 'loading',
				isClosable: true,
				position: 'top-right'
			});
			let isError = false;
			data
				.wait?.()
				?.then((final) => {
					if (final.status === 1) {
						if (confirmingTxToastRef.current) {
							toast.close(confirmingTxToastRef.current);
						}
						toast(formatSuccessToast(variables));
					} else {
						isError = true;
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
					isError = true;
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
				})
				?.finally(() => {
					sendSwapEvent({
						chain: selectedChain.value,
						user: address,
						from: variables.from,
						to: variables.to,
						aggregator: variables.adapter,
						isError,
						quote: variables.rawQuote,
						txUrl,
						amount: String(amount),
						errorData: {},
						amountUsd: +fromTokenPrice * +amount || 0
					});
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

	const debouncedAmountWithDecimals = useDebounce(amountWithDecimals, 300);

	const { data: routes = [], isLoading } = useGetRoutes({
		chain: selectedChain?.value,
		from: finalSelectedFromToken?.value,
		to: finalSelectedToToken?.value,
		amount: debouncedAmountWithDecimals,
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

	const { gasTokenPrice = 0, toTokenPrice, fromTokenPrice } = tokenPrices || {};

	const {
		isApproved,
		approve,
		approveInfinite,
		approveReset,
		isLoading: isApproveLoading,
		isInfiniteLoading: isApproveInfiniteLoading,
		isResetLoading: isApproveResetLoading,
		isConfirmingApproval,
		isConfirmingInfiniteApproval,
		isConfirmingResetApproval,
		shouldRemoveApproval,
		allowance
	} = useTokenApprove(finalSelectedFromToken?.address, route?.price?.tokenApprovalAddress, amountWithDecimals);

	const onMaxClick = () => {
		if (balance?.data?.formatted) {
			if (
				route?.price?.estimatedGas &&
				gasPriceData?.formatted?.gasPrice &&
				finalSelectedFromToken?.address === ethers.constants.AddressZero
			) {
				const gas = (+route.price.estimatedGas * +gasPriceData?.formatted?.gasPrice * 2) / 1e18;

				const amountWithoutGas = +balance?.data?.formatted - gas;

				setAmount(amountWithoutGas);
			} else {
				setAmount(balance?.data?.formatted);
			}
		}
	};

	const onChainChange = (newChain) => {
		setRoute(null);
		router.push({ pathname: '/', query: { chain: newChain.value } }, undefined, { shallow: true }).then(() => {
			if (switchNetwork) switchNetwork(newChain.chainId);
		});
	};

	const onFromTokenChange = (token) => {
		setRoute(null);
		router.push({ pathname: router.pathname, query: { ...router.query, from: token.address } }, undefined, {
			shallow: true
		});
	};

	const onToTokenChange = (token) => {
		setRoute(null);
		router.push({ pathname: router.pathname, query: { ...router.query, to: token.address } }, undefined, {
			shallow: true
		});
	};

	const setTokens = (tokens) => {
		setRoute(null);
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

			const amountUsd = toTokenPrice ? (amount * toTokenPrice).toFixed(2) : null;

			const netOut = amountUsd ? (route.l1Gas !== 'Unknown' ? +amountUsd - +gasUsd : +amountUsd) : amount;

			return { route, gasUsd, amountUsd, amount, netOut, ...route };
		})
		.filter(({ fromAmount, amount: toAmount }) => Number(toAmount) && amountWithDecimals === fromAmount)
		.sort((a, b) => b.netOut - a.netOut)
		.map((route, i, arr) => ({ ...route, lossPercent: route.netOut / arr[0].netOut }));

	normalizedRoutes = normalizedRoutes
		.filter((r) => r.gasUsd !== 'Unknown')
		.concat(normalizedRoutes.filter((r) => r.gasUsd === 'Unknown'));

	const medianAmount = median(normalizedRoutes.map(({ amount }) => amount));

	normalizedRoutes = normalizedRoutes.filter(({ amount }) => amount < medianAmount * 3);

	const priceImpact =
		fromTokenPrice && toTokenPrice && route?.route?.amountUsd > 0
			? 100 - (route?.route?.amountUsd / (+fromTokenPrice * +amount)) * 100
			: 0;

	const isUSDTNotApprovedOnEthereum =
		selectedChain && finalSelectedFromToken && selectedChain.id === 1 && shouldRemoveApproval;

	useEffect(() => {
		const id = setTimeout(() => {
			if (customSlippage && !Number.isNaN(customSlippage) && slippage !== customSlippage) {
				router.push({ pathname: '/', query: { ...router.query, slippage: customSlippage } }, undefined, {
					shallow: true
				});
			}
		}, 300);

		return () => clearTimeout(id);
	}, [slippage, customSlippage, router]);

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
									<FormControl display="flex" alignItems="center" gap="4px" justifyContent={'center'}>
										<FormLabel htmlFor="privacy-switch" margin={0}>
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
								tokens={tokensInChain}
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
								icon={<ArrowRight size={16} />}
								aria-label="Switch Tokens"
								marginTop="auto"
							/>

							<TokenSelect
								tokens={tokensInChain}
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

						<Flex flexDir="column" gap="16px" marginBottom="16px">
							<Flex alignItems="center" justifyContent="space-between" marginX="4px" marginTop="8px">
								<Text minH="22px">
									{fromTokenPrice
										? `Value: $
										${(+fromTokenPrice * +amount).toLocaleString(undefined, {
											maximumFractionDigits: 3
										})}`
										: ''}
								</Text>

								{balance.isSuccess ? (
									<Button
										textDecor="underline"
										bg="none"
										p={0}
										fontWeight="400"
										fontSize="0.875rem"
										ml="auto"
										height="fit-content"
										onClick={onMaxClick}
									>
										Balance:{' '}
										{(+balance?.data?.formatted).toLocaleString(undefined, {
											maximumFractionDigits: 3
										})}
									</Button>
								) : null}
							</Flex>

							<Box display="flex" flexDir="column" marginX="4px">
								<Text
									fontWeight="400"
									display="flex"
									justifyContent="space-between"
									alignItems="center"
									fontSize="0.875rem"
								>
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
												background: 'black',
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
						</Flex>
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
								{router && address && (
									<>
										<>
											{isUSDTNotApprovedOnEthereum && (
												<Flex flexDir="column" gap="4px" w="100%">
													<Text fontSize="0.75rem" fontWeight={400}>
														{`USDT uses an old token implementation that requires resetting approvals if there's a
														previous approval, and you currently have an approval for ${(
															Number(allowance) /
															10 ** finalSelectedFromToken.decimals
														).toFixed(2)} USDT for this contract, you
														need to reset your approval and approve again`}
													</Text>
													<Button
														isLoading={isApproveResetLoading}
														loadingText={isConfirmingResetApproval ? 'Confirming' : 'Preparing transaction'}
														colorScheme={'messenger'}
														onClick={() => {
															if (approveReset) approveReset();
														}}
														disabled={isApproveResetLoading}
													>
														Reset Approval
													</Button>
												</Flex>
											)}

											<Button
												isLoading={swapMutation.isLoading || isApproveLoading}
												loadingText={isConfirmingApproval ? 'Confirming' : 'Preparing transaction'}
												colorScheme={'messenger'}
												onClick={() => {
													if (approve) approve();

													if (+amount > +balance?.data?.formatted) return;

													if (isApproved) handleSwap();
												}}
												disabled={
													isUSDTNotApprovedOnEthereum ||
													swapMutation.isLoading ||
													isApproveLoading ||
													isApproveResetLoading ||
													!route
												}
											>
												{!route ? 'Select Aggregator' : isApproved ? 'Swap' : 'Approve'}
											</Button>

											{!isApproved && ['Matcha/0x', '1inch', 'CowSwap'].includes(route?.name) && (
												<Button
													colorScheme={'messenger'}
													loadingText={isConfirmingInfiniteApproval ? 'Confirming' : 'Preparing transaction'}
													isLoading={isApproveInfiniteLoading}
													onClick={() => {
														if (approveInfinite) approveInfinite();
													}}
													disabled={
														isUSDTNotApprovedOnEthereum ||
														swapMutation.isLoading ||
														isApproveLoading ||
														isApproveResetLoading ||
														isApproveInfiniteLoading
													}
												>
													{'Approve Infinite'}
												</Button>
											)}
										</>
									</>
								)}
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

				<Routes>
					{normalizedRoutes?.length ? <FormHeader>Routes</FormHeader> : null}

					{isLoading && amount && finalSelectedFromToken && finalSelectedToToken ? (
						<Loader />
					) : normalizedRoutes?.length ? null : (
						<RoutesPreview />
					)}

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
								gasPriceData?.formatted?.gasPrice +
								r?.name
							}
						/>
					))}
				</Routes>
			</BodyWrapper>

			<FAQs />

			<TransactionModal open={txModalOpen} setOpen={setTxModalOpen} link={txUrl} />
		</Wrapper>
	);
}
