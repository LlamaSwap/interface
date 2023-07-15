import { useRef, useState, useEffect } from 'react';
import gib from '~/public/gib.png';
import gibr from '~/public/gibr.png';
import { useMutation } from '@tanstack/react-query';
import {
	useAccount,
	useBlockNumber,
	useContractRead,
	useContractWrite,
	useFeeData,
	useNetwork,
	usePrepareContractWrite,
	useQueryClient,
	useSigner,
	useSwitchNetwork
} from 'wagmi';
import { useAddRecentTransaction, useConnectModal } from '@rainbow-me/rainbowkit';
import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';
import { ArrowDown } from 'react-feather';
import styled from 'styled-components';
import {
	Heading,
	useToast,
	Button,
	Flex,
	Box,
	IconButton,
	Text,
	ToastId,
	Alert,
	AlertIcon,
	Image,
	VStack
} from '@chakra-ui/react';
import { adaptersNames, swap } from './router';
import { inifiniteApprovalAllowed } from './list';
import { useTokenApprove } from './hooks';
import { useGetRoutes } from '~/queries/useGetRoutes';
import { useGetPrice } from '~/queries/useGetPrice';
import { PRICE_IMPACT_WARNING_THRESHOLD } from './constants';
import type { IToken } from '~/types';
import { sendSwapEvent } from './adapters/utils';
import { useRouter } from 'next/router';
import { TransactionModal } from '../TransactionModal';
import { formatSuccessToast } from '~/utils/formatToast';
import { useDebounce } from '~/hooks/useDebounce';
import { useLocalStorage } from '~/hooks/useLocalStorage';
import SwapConfirmation from './SwapConfirmation';
import { useBalance } from '~/queries/useBalance';
import { InputAmountAndTokenSelect } from '../InputAmountAndTokenSelect';
import { useCountdownFull } from '~/hooks/useCountdown';
import { ChevronRightIcon } from '@chakra-ui/icons';
import { formatAmount } from '~/utils/formatAmount';
import { allChains } from '~/components/WalletProvider/chains';
import { IconImage } from './Search';
import { CLAIM_ABI } from './claimAbi';
import { chainToId } from './adapters/llamazip';

const Body = styled.div<{ showRoutes: boolean }>`
	display: flex;
	flex-direction: column;
	gap: 20px;
	padding: 16px;
	width: 100%;
	max-width: 30rem;
	border: 1px solid #2f333c;
	align-self: flex-start;

	z-index: 1;

	@media screen and (min-width: ${({ theme }) => theme.bpLg}) {
		position: sticky;
		top: 24px;
	}

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
	min-height: 100%;
	text-align: center;
	display: flex;
	flex-direction: column;
	grid-row-gap: 24px;
	margin: 60px auto;

	h1 {
		font-weight: 500;
	}

	#gib-img-l,
	#gib-img-r {
		display: none;
	}

	@media screen and (min-width: 768px) {
		#gib-img-l,
		#gib-img-r {
			display: initial;
		}
	}

	@media screen and (min-width: ${({ theme }) => theme.bpMed}) {
		top: 0px;
	}

	@media screen and (max-width: ${({ theme }) => theme.bpMed}) {
		flex-direction: column;
		display: flex;
	}
`;

const BodyWrapper = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 100%;
	z-index: 1;
	position: relative;
	justify-content: center;

	& > * {
		margin: 0 auto;
	}

	@media screen and (min-width: ${({ theme }) => theme.bpLg}) {
		flex-direction: row;
		align-items: flex-start;
		justify-content: center;
		gap: 24px;

		& > * {
			flex: 1;
			margin: 0;
		}
	}
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

const Gib = () => {
	return (
		<>
			<Image src={gibr.src} w="128px" position={'fixed'} bottom={'0px'} left={'0px'} alt="" id="gib-img-l" />
			<Image src={gib.src} w="128px" position={'fixed'} bottom="0px" right={'0px'} alt="" id="gib-img-r" />
		</>
	);
};

const icons = {
	weth: 'https://icons.llamao.fi/icons/chains/rsz_ethereum?w=48&h=48',
	arb: 'https://icons.llamao.fi/icons/chains/rsz_arbitrum?w=48&h=48'
};

const ARBITRUM = {
	name: 'Arbitrum',
	label: 'Arbitrum',
	symbol: 'ARB',
	address: '0x912CE59144191C1204E64559FE8253a0e49E6548'.toLowerCase(),
	value: '0x912CE59144191C1204E64559FE8253a0e49E6548'.toLowerCase(),
	decimals: 18,
	logoURI: icons.arb,
	chainId: 42161,
	geckoId: null
};

const ETHEREUM = {
	name: 'Ethereum',
	label: 'Ethereum',
	symbol: 'ETH',
	address: ethers.constants.AddressZero,
	value: ethers.constants.AddressZero,
	decimals: 18,
	logoURI: icons.weth,
	chainId: 42161,
	geckoId: null
};

const AIRDROP_BLOCK = 16890400;

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

function Slippage({ slippage, setSlippage, fromToken, toToken }) {
	if (Number.isNaN(slippage)) {
		throw new Error('Wrong slippage!');
	}
	return (
		<Box display="flex" flexDir="column" marginX="4px">
			{!!slippage && slippage > 1 ? (
				<Alert status="warning" borderRadius="0.375rem" py="8px">
					<AlertIcon />
					High slippage! You might get sandwiched with a slippage of {slippage}%
				</Alert>
			) : null}
			{!!slippage && slippage > 0.05 && stablecoins.includes(fromToken) && stablecoins.includes(toToken) ? (
				<Alert status="warning" borderRadius="0.375rem" py="8px">
					<AlertIcon />
					You are trading stablecoins but your slippage is very high, we recommend setting it to 0.05% or lower
				</Alert>
			) : null}
			<Text fontWeight="400" display="flex" justifyContent="space-between" alignItems="center" fontSize="0.875rem">
				Swap Slippage: {slippage && !Number.isNaN(Number(slippage)) ? Number(slippage) + '%' : ''}
			</Text>
			<Box display="flex" gap="6px" flexWrap="wrap" width="100%">
				{['0.1', '0.5', '1', '5'].map((slippage) => (
					<Button
						fontSize="0.875rem"
						fontWeight="500"
						p="8px"
						bg="#38393e"
						height="2rem"
						onClick={() => {
							setSlippage(slippage);
						}}
						key={'slippage-btn' + slippage}
					>
						{slippage}%
					</Button>
				))}
			</Box>
		</Box>
	);
}

const selectedChain = allChains.find(({ id }) => id === 42161);
const fromTokensList = [];
const toTokensList = [];
const disabledAdapters = adaptersNames.filter((name) => name !== 'LlamaZip');

export function AggregatorContainer() {
	// wallet stuff
	const { data: signer } = useSigner();
	const { address, isConnected } = useAccount();
	const { chain: chainOnWallet } = useNetwork();
	const { openConnectModal } = useConnectModal();
	const { switchNetwork } = useSwitchNetwork();
	const addRecentTransaction = useAddRecentTransaction();
	const wagmiClient = useQueryClient();

	const { data: blockNumber } = useBlockNumber({
		chainId: 1,
		watch: true
	});

	// swap input fields and selected aggregator states
	const [aggregator, setAggregator] = useState('LlamaZip');

	const [isPrivacyEnabled, setIsPrivacyEnabled] = useLocalStorage('llamaswap-isprivacyenabled', false);
	const [[amount, amountOut], setAmount] = useState<[number | string, number | string]>(['10', '']);

	const [slippage, setSlippage] = useLocalStorage('arbidrop-slippage', '1');

	// post swap states
	const [txModalOpen, setTxModalOpen] = useState(false);
	const [txUrl, setTxUrl] = useState('');
	const confirmingTxToastRef = useRef<ToastId>();
	const toast = useToast();

	// debounce input amount and limit no of queries made to aggregators api, to avoid CORS errors
	const [debouncedAmount, debouncedAmountOut] = useDebounce([formatAmount(amount), formatAmount(amountOut)], 300);

	// get selected chain and tokens from URL query params
	const routesRef = useRef(null);
	const router = useRouter();
	const [{ fromTokenAddress, toTokenAddress }, setTokens] = useState({
		fromTokenAddress: ARBITRUM.address,
		toTokenAddress: ETHEREUM.address
	});

	const isValidSelectedChain = selectedChain && chainOnWallet ? selectedChain.id === chainOnWallet.id : false;
	const isOutputTrade = amountOut && amountOut !== '';

	// final tokens data
	const { finalSelectedFromToken, finalSelectedToToken } = {
		finalSelectedFromToken: fromTokenAddress === ETHEREUM.address ? ETHEREUM : ARBITRUM,
		finalSelectedToToken: toTokenAddress === ETHEREUM.address ? ETHEREUM : ARBITRUM
	};

	// format input amount of selected from token
	const amountWithDecimals = BigNumber(debouncedAmount && debouncedAmount !== '' ? debouncedAmount : '0')
		.times(BigNumber(10).pow(finalSelectedFromToken?.decimals || 18))
		.toFixed(0);
	const amountOutWithDecimals = BigNumber(debouncedAmountOut && debouncedAmountOut !== '' ? debouncedAmountOut : '0')
		.times(BigNumber(10).pow(finalSelectedToToken?.decimals || 18))
		.toFixed(0);

	// selected from token's balances
	const balance = useBalance({ address, token: finalSelectedFromToken?.address, chainId: selectedChain.id });
	// selected from token's balances
	const toTokenBalance = useBalance({ address, token: finalSelectedToToken?.address, chainId: selectedChain.id });

	const { data: gasPriceData } = useFeeData({
		chainId: selectedChain.id,
		enabled: true
	});

	const {
		data: routes = [],
		isLoading,
		isLoaded,
		refetch
	} = useGetRoutes({
		chain: selectedChain.network,
		from: finalSelectedFromToken?.value,
		to: finalSelectedToToken?.value,
		amount: amountWithDecimals,
		disabledAdapters,
		extra: {
			gasPriceData,
			userAddress: address || ethers.constants.AddressZero,
			amount: debouncedAmount,
			fromToken: finalSelectedFromToken,
			toToken: finalSelectedToToken,
			slippage,
			isPrivacyEnabled,
			amountOut: amountOutWithDecimals
		}
	});

	const { data: degenRoutes = [] } = useGetRoutes({
		chain: selectedChain.network,
		from: ARBITRUM.value,
		to: ETHEREUM.value,
		amount: balance?.data?.value.toString(),
		disabledAdapters,
		customRefetchInterval: 5_000,
		extra: {
			gasPriceData,
			userAddress: address || ethers.constants.AddressZero,
			amount: balance?.data?.formatted,
			fromToken: ARBITRUM,
			toToken: ETHEREUM,
			slippage,
			isPrivacyEnabled,
			amountOut: amountOutWithDecimals
		}
	});

	const { data: gasData, isLoading: isGasDataLoading } = { isLoading: true, data: {} };
	const { data: tokenPrices, isLoading: fetchingTokenPrices } = useGetPrice({
		chain: selectedChain?.network,
		toToken: finalSelectedToToken?.address,
		fromToken: finalSelectedFromToken?.address
	});

	const { gasTokenPrice = 0, toTokenPrice, fromTokenPrice } = tokenPrices || {};

	// format routes
	const fillRoute = (route: typeof routes[0]) => {
		if (!route?.price) return null;
		const gasEstimation = +(!isGasDataLoading && isLoaded && gasData?.[route.name]?.gas
			? gasData?.[route.name]?.gas
			: route.price.estimatedGas);
		let gasUsd: number | string = (gasTokenPrice * gasEstimation * +gasPriceData?.formatted?.gasPrice) / 1e18 || 0;

		// CowSwap native token swap
		gasUsd =
			route.price.feeAmount && finalSelectedFromToken.address === ethers.constants.AddressZero
				? (route.price.feeAmount / 1e18) * gasTokenPrice + gasUsd
				: gasUsd;

		gasUsd = route.l1Gas !== 'Unknown' && route.l1Gas ? route.l1Gas * gasTokenPrice + gasUsd : gasUsd;

		gasUsd = route.l1Gas === 'Unknown' ? 'Unknown' : gasUsd;

		const amount = +route.price.amountReturned / 10 ** +finalSelectedToToken?.decimals;
		const amountIn = (+route.fromAmount / 10 ** +finalSelectedFromToken?.decimals).toFixed(
			finalSelectedFromToken?.decimals
		);

		const amountUsd = toTokenPrice ? (amount * toTokenPrice).toFixed(2) : null;
		const amountInUsd = fromTokenPrice ? (+amountIn * fromTokenPrice).toFixed(6) : null;

		const netOut = amountUsd ? (route.l1Gas !== 'Unknown' ? +amountUsd - +gasUsd : +amountUsd) : amount;

		return {
			...route,
			isFailed: gasData?.[route.name]?.isFailed || false,
			route,
			gasUsd: gasUsd === 0 && route.name !== 'CowSwap' ? 'Unknown' : gasUsd,
			amountUsd,
			amount,
			netOut,
			amountIn,
			amountInUsd
		};
	};

	const allRoutes = [...(routes || [])]?.map(fillRoute);
	let normalizedRoutes = allRoutes
		.filter(
			({ fromAmount, amount: toAmount, isFailed }) =>
				(amountOutWithDecimals === '0' ? Number(toAmount) && amountWithDecimals === fromAmount : true) &&
				isFailed !== true
		)
		.sort((a, b) => {
			if (a.gasUsd === 'Unknown') {
				return 1;
			} else if (b.gasUsd === 'Unknown') {
				return -1;
			}
			return isOutputTrade
				? typeof a.amountInUsd === 'number' &&
				  typeof a.gasUsd === 'number' &&
				  typeof b.amountInUsd === 'number' &&
				  typeof b.gasUsd === 'number'
					? a.amountInUsd + a.gasUsd - (b.amountInUsd + b.gasUsd)
					: Number(a.amountIn) - Number(b.amountIn)
				: b.netOut - a.netOut;
		})
		.map((route, i, arr) => ({ ...route, lossPercent: route.netOut / arr[0].netOut }));

	const selecteRouteIndex =
		aggregator && normalizedRoutes && normalizedRoutes.length > 0
			? normalizedRoutes.findIndex((r) => r.name === aggregator)
			: -1;

	// store selected aggregators route
	const selectedRoute =
		selecteRouteIndex >= 0 ? { ...normalizedRoutes[selecteRouteIndex], index: selecteRouteIndex } : null;

	// functions to handle change in swap input fields
	const onMaxClick = () => {
		if (balance.data && balance.data.formatted && !Number.isNaN(Number(balance.data.formatted))) {
			if (
				selectedRoute &&
				selectedRoute.price.estimatedGas &&
				gasPriceData?.formatted?.gasPrice &&
				finalSelectedFromToken?.address === ethers.constants.AddressZero
			) {
				const gas = (+selectedRoute.price.estimatedGas * +gasPriceData?.formatted?.gasPrice * 2) / 1e18;

				const amountWithoutGas = +balance.data.formatted - gas;

				setAmount([amountWithoutGas, '']);
			} else {
				setAmount([balance.data.formatted === '0.0' ? 0 : balance.data.formatted, '']);
			}
		}
	};

	const onFromTokenChange = (token) => {
		setAggregator(null);
		router.push({ pathname: router.pathname, query: { ...router.query, from: token.address } }, undefined, {
			shallow: true
		});
	};
	const onToTokenChange = (token) => {
		setAggregator(null);
		router.push({ pathname: router.pathname, query: { ...router.query, to: token?.address || undefined } }, undefined, {
			shallow: true
		});
	};

	const priceImpactRoute = selectedRoute ? fillRoute(selectedRoute) : null;

	const selectedRoutesPriceImpact =
		fromTokenPrice &&
		toTokenPrice &&
		priceImpactRoute &&
		priceImpactRoute.amountUsd &&
		priceImpactRoute.amountInUsd &&
		(debouncedAmount || debouncedAmountOut) &&
		!Number.isNaN(Number(priceImpactRoute.amountUsd))
			? 100 - (Number(priceImpactRoute.amountUsd) / Number(priceImpactRoute.amountInUsd)) * 100
			: null;

	const hasPriceImapct =
		selectedRoutesPriceImpact === null || Number(selectedRoutesPriceImpact) > PRICE_IMPACT_WARNING_THRESHOLD;
	const hasMaxPriceImpact = selectedRoutesPriceImpact !== null && Number(selectedRoutesPriceImpact) > 30;

	const insufficientBalance =
		balance.isSuccess &&
		balance.data &&
		!Number.isNaN(Number(balance.data.formatted)) &&
		balance.data.value &&
		selectedRoute
			? +selectedRoute?.fromAmount > +balance.data.value
			: false;

	const slippageIsWong = Number.isNaN(Number(slippage)) || slippage === '';

	const forceRefreshTokenBalance = () => {
		if (chainOnWallet && address) {
			wagmiClient.invalidateQueries([{ addressOrName: address, chainId: chainOnWallet.id, entity: 'balance' }]);
		}
	};

	// approve/swap tokens
	const amountToApprove = BigNumber(11000).times(1e18).toFixed(0);
	const amountToInfiniteApprove = BigNumber(30000).times(1e18).toFixed(0);

	const {
		isApproved,
		approve,
		approveInfinite,
		isLoading: isApproveLoading,
		isInfiniteLoading: isApproveInfiniteLoading,
		isResetLoading: isApproveResetLoading,
		isConfirmingApproval,
		isConfirmingInfiniteApproval,
		shouldRemoveApproval,
		allowance
	} = useTokenApprove(finalSelectedFromToken?.address as `0x${string}`, chainToId.arbitrum as any, amountToApprove);

	const { approve: approveNonInfinite, isLoading: isApproveNonInfiniteLoading } = useTokenApprove(
		finalSelectedFromToken?.address as `0x${string}`,
		chainToId.arbitrum as any,
		amountToInfiniteApprove
	);

	useEffect(() => {
		if (isConnected && chainOnWallet.id !== 42161) {
			switchNetwork?.(42161);
		}
	}, [chainOnWallet]);

	useEffect(() => {
		if (isConnected && chainOnWallet.id !== 42161) {
			switchNetwork?.(42161);
		}
	}, []);

	const isUSDTNotApprovedOnEthereum =
		selectedChain && finalSelectedFromToken && selectedChain.id === 1 && shouldRemoveApproval;
	const swapMutation = useMutation({
		mutationFn: (params: {
			chain: string;
			from: string;
			to: string;
			amount: string | number;
			amountIn: string;
			adapter: string;
			signer: ethers.Signer;
			slippage: string;
			rawQuote: any;
			tokens: { toToken: IToken; fromToken: IToken };
			index: number;
			route: any;
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
					forceRefreshTokenBalance();

					toast(formatSuccessToast(variables));

					sendSwapEvent({
						chain: selectedChain.network,
						user: address,
						from: variables.from,
						to: variables.to,
						aggregator: variables.adapter,
						isError,
						quote: variables.rawQuote,
						txUrl,
						amount: String(variables.amountIn),
						amountUsd: +fromTokenPrice * +variables.amountIn || 0,
						errorData: {},
						slippage,
						routePlace: String(variables?.index),
						route: variables.route
					});
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
						forceRefreshTokenBalance();

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
						chain: selectedChain.network,
						user: address,
						from: variables.from,
						to: variables.to,
						aggregator: variables.adapter,
						isError,
						quote: variables.rawQuote,
						txUrl,
						amount: String(variables.amountIn),
						amountUsd: +fromTokenPrice * +variables.amountIn || 0,
						errorData: {},
						slippage,
						routePlace: String(variables?.index),
						route: variables.route
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
					chain: selectedChain.network,
					user: address,
					from: variables.from,
					to: variables.to,
					aggregator: variables.adapter,
					isError: true,
					quote: variables.rawQuote,
					txUrl: '',
					amount: String(variables.amountIn),
					amountUsd: +fromTokenPrice * +variables.amountIn || 0,
					errorData: err,
					slippage,
					routePlace: String(variables?.index),
					route: variables.route
				});
			}
		}
	});

	const handleSwap = () => {
		if (normalizedRoutes.length && normalizedRoutes[0]?.name === 'LlamaZip') {
			if (+normalizedRoutes[0].fromAmount > 11_000 * 10 ** 18) {
				toast({
					title: 'Your size is size. Please use swap.defillama.com',
					status: 'warning',
					duration: 10000,
					isClosable: true,
					position: 'top-right',
					containerStyle: {
						width: '100%',
						maxWidth: '300px'
					}
				});
				return;
			}
			swapMutation.mutate({
				chain: selectedChain.network,
				from: finalSelectedFromToken.value,
				to: finalSelectedToToken.value,
				signer,
				slippage,
				adapter: normalizedRoutes[0].name,
				rawQuote: normalizedRoutes[0].price.rawQuote,
				tokens: { fromToken: finalSelectedFromToken, toToken: finalSelectedToToken },
				index: 0,
				route: normalizedRoutes[0],
				amount: normalizedRoutes[0].amount,
				amountIn: normalizedRoutes[0].amountIn
			});
		}
	};

	const isValidDegenSwap =
		degenRoutes.length && degenRoutes[0]?.name === 'LlamaZip' && balance.data && balance.data.formatted !== '0.0';

	const handleDegenSwap = () => {
		if (isValidDegenSwap) {
			if (+degenRoutes[0].fromAmount > 11_000 * 10 ** 18) {
				toast({
					title: 'Your size is size. Please use swap.defillama.com',
					status: 'warning',
					duration: 10000,
					isClosable: true,
					position: 'top-right',
					containerStyle: {
						width: '100%',
						maxWidth: '300px'
					}
				});
				return;
			}
			swapMutation.mutate({
				chain: selectedChain.network,
				from: ARBITRUM.value,
				to: ETHEREUM.value,
				signer,
				slippage,
				adapter: degenRoutes[0].name,
				rawQuote: degenRoutes[0].price.rawQuote,
				tokens: { fromToken: ARBITRUM, toToken: ETHEREUM },
				index: 0,
				route: degenRoutes[0],
				amount: degenRoutes[0].price.amountReturned,
				amountIn: (+degenRoutes[0].fromAmount / 1e18).toFixed(6)
			});
		}
	};

	const isAmountSynced = debouncedAmount === formatAmount(amount) && formatAmount(amountOut) === debouncedAmountOut;

	const { data: claimableTokens } = useContractRead({
		address: '0x67a24CE4321aB3aF51c2D0a4801c3E111D88C9d9',
		abi: CLAIM_ABI,
		functionName: 'claimableTokens',
		args: [address]
	});

	const { config } = usePrepareContractWrite({
		address: '0x67a24CE4321aB3aF51c2D0a4801c3E111D88C9d9',
		abi: CLAIM_ABI,
		functionName: 'claim',
		enabled: isConnected,
		overrides: {
			maxFeePerGas: BigNumber(40).times(1e9).toFixed(0, 1) as any,
			maxPriorityFeePerGas: BigNumber(10).times(1e9).toFixed(0, 1) as any
		}
	});

	const { write: claim, isLoading: isClaimLoading } = useContractWrite({
		...config,
		onSuccess: () => {
			toast({
				title: 'Claimed successfully',
				status: 'success',
				duration: 10000,
				isClosable: true,
				position: 'top-right',
				containerStyle: {
					width: '100%',
					maxWidth: '300px'
				}
			});
		}
	});

	const blocksTillAirdrop = blockNumber ? AIRDROP_BLOCK - blockNumber : null;

	const {
		countdown: { days, hours, minutes, seconds },
		start,
		isStarted
	} = useCountdownFull(
		blocksTillAirdrop ? new Date().getTime() + blocksTillAirdrop * 12 * 1000 - new Date().getTime() : 0
	);

	if (blocksTillAirdrop && !isStarted) {
		start();
	}

	const isEth = finalSelectedFromToken.address === ETHEREUM.address;

	const sizeIsSize = +amountWithDecimals > 11_000 * 10 ** 18 || isEth ? +amountWithDecimals > 10 * 10 ** 18 : false;
	const degenSizeIsSize = +degenRoutes?.[0]?.fromAmount > 11_000 * 10 ** 18;

	const isClaimable = claimableTokens && (claimableTokens as any)?.gt(0);

	const isDegenApproved =
		allowance &&
		balance.data &&
		!Number.isNaN(Number(balance.data.formatted)) &&
		!Number.isNaN(Number(+allowance.toString() / 1e18))
			? +allowance.toString() / 1e18 > +balance.data.formatted
			: false;
	const enoughApproval = !isEth
		? allowance &&
		  normalizedRoutes?.[0]?.fromAmount &&
		  !Number.isNaN(Number(+allowance?.toString())) &&
		  +allowance.toString() >= +balance?.data?.value?.toString()
		: true;

	const arbPriceUsd = isEth
		? fromTokenPrice / (normalizedRoutes?.[0]?.price.amountReturned / +normalizedRoutes?.[0]?.fromAmount)
		: toTokenPrice / (+normalizedRoutes?.[0]?.fromAmount / normalizedRoutes?.[0]?.price?.amountReturned);

	return (
		<Wrapper>
			<Heading>Arbitrum Airdrop X DefiLlama</Heading>

			<Text color={'orange.400'} fontSize="16px" mb={'8px'}>
				To get your txs accepted you need to increase priority fee and max fee in metamask.
			</Text>
			<BodyWrapper>
				{blocksTillAirdrop < 0 ? (
					<Box
						id="dexscreener-embed"
						pos="relative"
						maxW="600px"
						height="739px"
						display={{ base: 'none', lg: 'block' }}
					>
						<iframe
							style={{ position: 'absolute', width: '600px', height: '739px', top: 0, left: 0, borderRadius: '16px' }}
							src="https://dexscreener.com/arbitrum/0xa8328bf492ba1b77ad6381b3f7567d942b000baf?embed=1&trades=0&info=0"
						></iframe>
					</Box>
				) : null}

				<Body showRoutes={finalSelectedFromToken && finalSelectedToToken ? true : false}>
					<Flex flexDir="column" gap="8px">
						<Text fontWeight={'bold'} fontSize={'20px'} textAlign="center">
							Step 1.
						</Text>

						{!isConnected ? (
							<>
								<Button
									colorScheme={'messenger'}
									loadingText={isConfirmingApproval ? 'Confirming' : 'Preparing transaction'}
									isLoading={isApproveInfiniteLoading}
									onClick={() => {
										openConnectModal?.();
									}}
									flex={1}
								>
									Connect
								</Button>
							</>
						) : null}

						<Flex
							flexDir={{ base: 'column', md: 'row' }}
							alignItems="center"
							justifyContent={'space-between'}
							gap="8px"
						>
							<Button
								colorScheme={'messenger'}
								loadingText={'Confirming'}
								isLoading={isApproveLoading}
								onClick={() => {
									if (approve) approve();
								}}
								disabled={!approve}
								w={{ base: '100%', md: '30%' }}
							>
								{'Approve 11k'}
							</Button>

							<Text fontWeight={'bold'}>OR</Text>

							<Button
								colorScheme={'messenger'}
								loadingText={'Confirming'}
								isLoading={isApproveNonInfiniteLoading}
								onClick={() => {
									if (approveNonInfinite) approveNonInfinite?.();
								}}
								disabled={!approveNonInfinite}
								w={{ base: '100%', md: '30%' }}
							>
								{'Approve 30k'}
							</Button>

							<ChevronRightIcon
								w="28px"
								h="28px"
								mx="-8px"
								my="-2px"
								transform={{ base: 'rotate(90deg)', md: 'rotate(0deg)' }}
							/>

							<Button
								colorScheme={'messenger'}
								loadingText={isConfirmingInfiniteApproval ? 'Confirming' : 'Preparing transaction'}
								isLoading={isClaimLoading}
								onClick={() => {
									if (claim) claim();
								}}
								disabled={!claim || !isClaimable}
								w={{ base: '100%', md: '40%' }}
							>
								{isClaimable ? (
									<>
										Claim <>({(+claimableTokens?.toString() / 10 ** 18).toFixed(0)} ARB)</>
									</>
								) : (
									<>Nothing to claim</>
								)}
							</Button>
						</Flex>
					</Flex>

					<Flex flexDir={'column'} gap="8px">
						<Text fontWeight={'bold'} fontSize={'20px'} textAlign={'center'}>
							Step 2.
						</Text>

						<VStack justifyContent={'center'}>
							{Number.isFinite(arbPriceUsd) ? (
								<Text fontWeight={'bold'} fontSize="16">
									Current price: 1 ARB = {arbPriceUsd.toFixed(3)}$
									<br />
								</Text>
							) : null}
						</VStack>

						<Button
							colorScheme={'messenger'}
							loadingText={isConfirmingInfiniteApproval ? 'Confirming' : 'Preparing transaction'}
							isLoading={swapMutation.isLoading}
							onClick={() => {
								handleDegenSwap();
							}}
							disabled={!isDegenApproved || degenSizeIsSize || !isValidDegenSwap}
							w="100%"
						>
							{'Sell all ARB (Degen mode)'}
						</Button>
					</Flex>

					{degenSizeIsSize ? (
						<Alert status="warning" borderRadius="0.375rem" py="8px" fontSize={'16px'}>
							<AlertIcon />
							Your size is size. Please use swap.defillama.com
						</Alert>
					) : null}

					<Text fontWeight={'bold'} fontSize={'16'} textAlign={'center'}>
						OR
					</Text>

					<Flex flexDir="column" gap="4px" pos="relative">
						<InputAmountAndTokenSelect
							placeholder={normalizedRoutes[0]?.amountIn}
							setAmount={setAmount}
							type="amountIn"
							amount={selectedRoute?.amountIn && amountOut !== '' ? selectedRoute.amountIn : amount}
							tokens={fromTokensList}
							token={finalSelectedFromToken}
							onSelectTokenChange={onFromTokenChange}
							selectedChain={selectedChain as any}
							balance={balance.data?.formatted}
							onMaxClick={onMaxClick}
							tokenPrice={fromTokenPrice}
							customSelect={
								<Button
									display="flex"
									gap="6px"
									flexWrap="nowrap"
									alignItems="center"
									w="100px"
									borderRadius="8px"
									bg="#222429"
									maxW={{ base: '100%', md: '9rem' }}
									p="12px"
								>
									<IconImage
										src={finalSelectedFromToken.logoURI}
										onError={(e) => (e.currentTarget.src = '/placeholder.png')}
									/>

									<Text
										as="span"
										color="white"
										overflow="hidden"
										whiteSpace="nowrap"
										textOverflow="ellipsis"
										fontWeight={400}
									>
										{finalSelectedFromToken.symbol}
									</Text>
								</Button>
							}
						/>

						<IconButton
							onClick={() =>
								setTokens((tokens) => ({
									fromTokenAddress: tokens.toTokenAddress,
									toTokenAddress: tokens.fromTokenAddress
								}))
							}
							icon={<ArrowDown size={14} />}
							aria-label="Switch Tokens"
							marginTop="auto"
							w="2.25rem"
							h="2.25rem"
							minW={0}
							p="0"
							pos="absolute"
							top="0"
							bottom="0"
							right="0"
							left="0"
							m="auto"
							borderRadius="8px"
							bg="#222429"
							_hover={{ bg: '#2d3037' }}
							color="white"
							zIndex={1}
						/>

						<InputAmountAndTokenSelect
							placeholder={normalizedRoutes[0]?.amount}
							setAmount={setAmount}
							type="amountOut"
							amount={selectedRoute?.amount && amount !== '' ? selectedRoute.amount : amountOut}
							tokens={toTokensList}
							token={finalSelectedToToken}
							onSelectTokenChange={onToTokenChange}
							selectedChain={selectedChain as any}
							balance={toTokenBalance.data?.formatted}
							tokenPrice={toTokenPrice}
							disabled
							priceImpact={selectedRoutesPriceImpact}
							customSelect={
								<Button
									display="flex"
									gap="6px"
									flexWrap="nowrap"
									alignItems="center"
									w="100px"
									borderRadius="8px"
									bg="#222429"
									maxW={{ base: '100%', md: '9rem' }}
									p="12px"
								>
									<IconImage
										src={finalSelectedToToken.logoURI}
										onError={(e) => (e.currentTarget.src = '/placeholder.png')}
									/>

									<Text
										as="span"
										color="white"
										overflow="hidden"
										whiteSpace="nowrap"
										textOverflow="ellipsis"
										fontWeight={400}
									>
										{finalSelectedToToken.symbol}
									</Text>
								</Button>
							}
						/>
					</Flex>

					<Button colorScheme={'messenger'} onClick={() => refetch?.()} w="fit-content" ml="auto">
						Refresh Price
					</Button>

					<Slippage
						slippage={slippage}
						setSlippage={setSlippage}
						fromToken={finalSelectedFromToken?.symbol}
						toToken={finalSelectedToToken?.symbol}
					/>

					{sizeIsSize ? (
						<Alert status="warning" borderRadius="0.375rem" py="8px" fontSize={'16px'}>
							<AlertIcon />
							Your size is size. Please use swap.defillama.com
						</Alert>
					) : null}

					<SwapWrapper>
						{!isConnected ? (
							<Button colorScheme={'messenger'} onClick={openConnectModal}>
								Connect Wallet
							</Button>
						) : !isValidSelectedChain ? (
							<Button colorScheme={'messenger'} onClick={() => switchNetwork(selectedChain.id)}>
								Switch Network
							</Button>
						) : insufficientBalance ? (
							<Button colorScheme={'messenger'} disabled>
								Insufficient Balance
							</Button>
						) : hasMaxPriceImpact ? (
							<Button colorScheme={'messenger'} disabled>
								Price impact is too large
							</Button>
						) : (
							<>
								{router && address && (
									<>
										<>
											{hasPriceImapct && !isLoading && selectedRoute && isApproved ? (
												<SwapConfirmation handleSwap={handleSwap} />
											) : (
												<Button
													isLoading={swapMutation.isLoading || isApproveLoading}
													loadingText={isConfirmingApproval ? 'Confirming' : 'Preparing transaction'}
													colorScheme={'messenger'}
													onClick={() => {
														//scroll Routes into view
														!selectedRoute && routesRef.current.scrollIntoView({ behavior: 'smooth' });

														if (!enoughApproval) approve();

														if (
															balance.data &&
															!Number.isNaN(Number(balance.data.value)) &&
															+selectedRoute?.fromAmount > +balance?.data?.value?.toString()
														)
															return;

														handleSwap();
													}}
													disabled={
														swapMutation.isLoading ||
														isApproveLoading ||
														isApproveResetLoading ||
														!(finalSelectedFromToken && finalSelectedToToken) ||
														insufficientBalance ||
														!selectedRoute ||
														slippageIsWong ||
														!isAmountSynced ||
														sizeIsSize ||
														fetchingTokenPrices
													}
												>
													{enoughApproval ? `Swap via LlamaZip` : slippageIsWong ? 'Set Slippage' : 'Approve'}
												</Button>
											)}

											{!isApproved && selectedRoute && inifiniteApprovalAllowed.includes(selectedRoute.name) && (
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
														isApproveInfiniteLoading ||
														!selectedRoute ||
														fetchingTokenPrices
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
				</Body>
			</BodyWrapper>

			<TransactionModal open={txModalOpen} setOpen={setTxModalOpen} link={txUrl} />
			<Gib />
		</Wrapper>
	);
}
