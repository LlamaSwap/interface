import { useMemo, useRef, useState, Fragment, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAccount, useFeeData, useNetwork, useQueryClient, useSigner, useSwitchNetwork, useToken } from 'wagmi';
import { useAddRecentTransaction, useConnectModal } from '@rainbow-me/rainbowkit';
import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';
import { ArrowDown } from 'react-feather';
import styled from 'styled-components';
import {
	useToast,
	Button,
	FormControl,
	FormLabel,
	Switch,
	Flex,
	Box,
	Spacer,
	IconButton,
	Text,
	ToastId,
	Alert,
	AlertIcon,
	CircularProgress,
	useBreakpoint,
	Popover,
	PopoverTrigger,
	PopoverContent
} from '@chakra-ui/react';
import ReactSelect from '~/components/MultiSelect';
import FAQs from '~/components/FAQs';
import SwapRoute, { LoadingRoute } from '~/components/SwapRoute';
import { adaptersNames, getAllChains, swap } from './router';
import { inifiniteApprovalAllowed } from './list';
import Loader from './Loader';
import { useTokenApprove } from './hooks';
import { REFETCH_INTERVAL, useGetRoutes } from '~/queries/useGetRoutes';
import { useGetPrice } from '~/queries/useGetPrice';
import { useTokenBalances } from '~/queries/useTokenBalances';
import { PRICE_IMPACT_WARNING_THRESHOLD, WETH } from './constants';
import Tooltip, { Tooltip2 } from '../Tooltip';
import type { IToken } from '~/types';
import { sendSwapEvent } from './adapters/utils';
import { useRouter } from 'next/router';
import { TransactionModal } from '../TransactionModal';
import { normalizeTokens } from '~/utils';
import RoutesPreview from './RoutesPreview';
import { formatSuccessToast, formatErrorToast } from '~/utils/formatToast';
import { useDebounce } from '~/hooks/useDebounce';
import { useGetSavedTokens } from '~/queries/useGetSavedTokens';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useLocalStorage } from '~/hooks/useLocalStorage';
import SwapConfirmation from './SwapConfirmation';
import { getBalance, useBalance } from '~/queries/useBalance';
import { useEstimateGas } from './hooks/useEstimateGas';
import { Slippage } from '../Slippage';
import { PriceImpact } from '../PriceImpact';
import { useQueryParams } from '~/hooks/useQueryParams';
import { useSelectedChainAndTokens } from '~/hooks/useSelectedChainAndTokens';
import { InputAmountAndTokenSelect } from '../InputAmountAndTokenSelect';
import { useCountdown } from '~/hooks/useCountdown';
import { Sandwich } from './Sandwich';
import { ArrowBackIcon, ArrowForwardIcon, RepeatIcon, SettingsIcon } from '@chakra-ui/icons';
import { Settings } from './Settings';
import { formatAmount } from '~/utils/formatAmount';

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

enum STATES {
	INPUT,
	ROUTES
}

const Body = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;
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

	@media screen and (max-width: ${({ theme }) => theme.bpMed}) {
		box-shadow: none;
	}
`;

const Wrapper = styled.div`
	width: 100%;
	height: 100%;
	min-height: 100%;
	text-align: center;
	display: flex;
	flex-direction: column;
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

	@media screen and (max-width: ${({ theme }) => theme.bpMed}) {
		flex-direction: column;
		display: flex;
	}
`;

const Routes = styled.div<{ visible: boolean }>`
	display: flex;
	flex-direction: column;
	padding: 16px;
	border-radius: 16px;
	text-align: left;
	overflow-y: scroll;
	width: 100%;
	min-height: 100%;
	overflow-x: hidden;
	align-self: stretch;
	max-width: 30rem;
	border: 1px solid #2f333c;

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

	@media screen and (max-width: ${({ theme }) => theme.bpMed}) {
		z-index: 10;
		background-color: #22242a;
		position: absolute;
		box-shadow: none;
		clip-path: ${({ visible }) => (visible ? 'inset(0 0 0 0);' : 'inset(0 0 0 100%);')};

		transition: all 0.4s;
		overflow: scroll;
		max-height: 100%;
	}
`;

const BodyWrapper = styled.div`
	display: flex;
	justify-content: center;
	gap: 16px;
	width: 100%;
	z-index: 1;
	position: relative;

	@media screen and (max-width: ${({ theme }) => theme.bpMed}) {
		margin-top: 8px;
		height: fi;
	}

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

const FormHeader = styled.div`
	font-weight: bold;
	font-size: 16px;
	margin-bottom: 4px;
	margin-left: 4px;
	.chakra-switch,
	.chakra-switch__track,
	.chakra-switch__thumb {
		height: 10px;
	}

	@media screen and (max-width: ${({ theme }) => theme.bpMed}) {
		margin: 0 auto;
		margin-bottom: 6px;
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

const SwapUnderRoute = styled(SwapWrapper)`
	margin-top: 16px;
	@media screen and (min-width: ${({ theme }) => theme.bpMed}) {
		display: none;
	}
`;

const ConnectButtonWrapper = styled.div`
	min-height: 40px;
	width: 100%;
	display: flex;
	flex-wrap: wrap;

	& button {
		width: 100%;
		text-align: center !important;
	}

	& > div {
		width: 100%;
	}
`;

const chains = getAllChains();

export function AggregatorContainer({ tokenList, sandwichList }) {
	// wallet stuff
	const { data: signer } = useSigner();
	const { address, isConnected } = useAccount();
	const { chain: chainOnWallet } = useNetwork();
	const { openConnectModal } = useConnectModal();
	const { switchNetwork } = useSwitchNetwork();
	const addRecentTransaction = useAddRecentTransaction();
	const wagmiClient = useQueryClient();

	// swap input fields and selected aggregator states
	const [aggregator, setAggregator] = useState(null);
	const [isPrivacyEnabled, setIsPrivacyEnabled] = useLocalStorage('llamaswap-isprivacyenabled', false);
	const [[amount, amountOut], setAmount] = useState<[number | string, number | string]>(['10', '']);

	const [slippage, setSlippage] = useLocalStorage('llamaswap-slippage', '0.5');
	const [lastOutputValue, setLastOutputValue] = useState(null);
	const [disabledAdapters, setDisabledAdapters] = useLocalStorage('llamaswap-disabledadapters', []);
	const [isDegenModeEnabled, _] = useLocalStorage('llamaswap-degenmode', false);
	const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);

	// mobile states
	const [uiState, setUiState] = useState(STATES.INPUT);
	const breakpoint = useBreakpoint();
	const isSmallScreen = breakpoint === 'sm' || breakpoint === 'base';
	const toggleUi = () => setUiState((state) => (state === STATES.INPUT ? STATES.ROUTES : STATES.INPUT));

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
	const { fromTokenAddress, toTokenAddress } = useQueryParams();
	const { selectedChain, selectedFromToken, selectedToToken, chainTokenList } = useSelectedChainAndTokens({
		tokens: tokenList
	});
	const isValidSelectedChain = selectedChain && chainOnWallet ? selectedChain.id === chainOnWallet.id : false;
	const isOutputTrade = amountOut && amountOut !== '';

	// data of selected token not in chain's tokenlist
	const { data: fromToken2 } = useToken({
		address: fromTokenAddress as `0x${string}`,
		chainId: selectedChain.id,
		enabled:
			typeof fromTokenAddress === 'string' && fromTokenAddress.length === 42 && selectedChain && !selectedFromToken
				? true
				: false
	});
	const { data: toToken2 } = useToken({
		address: toTokenAddress as `0x${string}`,
		chainId: selectedChain.id,
		enabled:
			typeof toTokenAddress === 'string' && toTokenAddress.length === 42 && selectedChain && !selectedToToken
				? true
				: false
	});
	// final tokens data
	const { finalSelectedFromToken, finalSelectedToToken } = useMemo(() => {
		const finalSelectedFromToken: IToken =
			!selectedFromToken && fromToken2
				? {
						name: fromToken2.name || fromToken2.address.slice(0, 4) + '...' + fromToken2.address.slice(-4),
						label: fromToken2.symbol || fromToken2.address.slice(0, 4) + '...' + fromToken2.address.slice(-4),
						symbol: fromToken2.symbol || '',
						address: fromToken2.address,
						value: fromToken2.address,
						decimals: fromToken2.decimals,
						logoURI: `https://token-icons.llamao.fi/icons/tokens/${selectedChain.id || 1}/${
							fromToken2.address
						}?h=20&w=20`,
						chainId: selectedChain.id || 1,
						geckoId: null
				  }
				: selectedFromToken;

		const finalSelectedToToken: IToken =
			!selectedToToken && toToken2
				? {
						name: toToken2.name || toToken2.address.slice(0, 4) + '...' + toToken2.address.slice(-4),
						label: toToken2.symbol || toToken2.address.slice(0, 4) + '...' + toToken2.address.slice(-4),
						symbol: toToken2.symbol || '',
						address: toToken2.address,
						value: toToken2.address,
						decimals: toToken2.decimals,
						logoURI: `https://token-icons.llamao.fi/icons/tokens/${selectedChain.id || 1}/${
							toToken2.address
						}?h=20&w=20`,
						chainId: selectedChain.id || 1,
						geckoId: null
				  }
				: selectedToToken;

		return { finalSelectedFromToken, finalSelectedToToken };
	}, [fromToken2, selectedChain?.id, toToken2, selectedFromToken, selectedToToken]);

	// format input amount of selected from token
	const amountWithDecimals = BigNumber(debouncedAmount && debouncedAmount !== '' ? debouncedAmount : '0')
		.times(BigNumber(10).pow(finalSelectedFromToken?.decimals || 18))
		.toFixed(0);
	const amountOutWithDecimals = BigNumber(debouncedAmountOut && debouncedAmountOut !== '' ? debouncedAmountOut : '0')
		.times(BigNumber(10).pow(finalSelectedToToken?.decimals || 18))
		.toFixed(0);

	// saved tokens list
	const savedTokens = useGetSavedTokens(selectedChain?.id);

	// selected from token's balances
	const balance = useBalance({ address, token: finalSelectedFromToken?.address, chainId: selectedChain.id });
	// selected from token's balances
	const toTokenBalance = useBalance({ address, token: finalSelectedToToken?.address, chainId: selectedChain.id });
	const { data: tokenBalances } = useTokenBalances(address);
	const { data: gasPriceData } = useFeeData({
		chainId: selectedChain?.id,
		enabled: selectedChain ? true : false
	});

	const tokensInChain = useMemo(() => {
		return (
			chainTokenList
				?.concat(savedTokens)
				.map((token) => {
					const tokenBalance = tokenBalances?.[selectedChain?.id]?.find(
						(t) => t.address.toLowerCase() === token?.address?.toLowerCase()
					);

					return {
						...token,
						amount: tokenBalance?.amount ?? 0,
						balanceUSD: tokenBalance?.balanceUSD ?? 0
					};
				})
				.sort((a, b) => b.balanceUSD - a.balanceUSD) ?? []
		);
	}, [chainTokenList, selectedChain?.id, tokenBalances, savedTokens]);

	const { fromTokensList, toTokensList } = useMemo(() => {
		return {
			fromTokensList: tokensInChain.filter(({ address }) => address !== finalSelectedToToken?.address),
			toTokensList: tokensInChain.filter(({ address }) => address !== finalSelectedFromToken?.address)
		};
	}, [tokensInChain, finalSelectedFromToken, finalSelectedToToken]);

	const {
		data: routes = [],
		isLoading,
		isLoaded,
		refetch,
		lastFetched,
		loadingRoutes
	} = useGetRoutes({
		chain: selectedChain?.value,
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

	const secondsToRefresh = useCountdown(lastFetched + REFETCH_INTERVAL);

	const { data: gasData, isLoading: isGasDataLoading } = useEstimateGas({
		routes,
		token: finalSelectedFromToken?.address,
		userAddress: address,
		chain: selectedChain.value,
		balance: +balance?.data?.value,
		isOutput: amountOut && amountOut !== ''
	});
	const { data: tokenPrices, isLoading: fetchingTokenPrices } = useGetPrice({
		chain: selectedChain?.value,
		toToken: finalSelectedToToken?.address,
		fromToken: finalSelectedFromToken?.address
	});

	const { data: halfAmountRoutes } = useGetRoutes({
		chain: selectedChain?.value,
		from: finalSelectedFromToken?.value,
		to: finalSelectedToToken?.value,
		amount: BigNumber(amountWithDecimals).div(2).toFixed(0),
		disabledAdapters: adaptersNames.filter((name) => name !== aggregator),
		extra: {
			gasPriceData,
			userAddress: address || ethers.constants.AddressZero,
			amount: debouncedAmount / 2,
			fromToken: finalSelectedFromToken,
			toToken: finalSelectedToToken,
			slippage,
			isPrivacyEnabled,
			amountOut: amountOutWithDecimals
		},
		enabled: !!aggregator
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
	const failedRoutes = allRoutes.filter((r) => r.isFailed === true);
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

	const diffBetweenSelectedRouteAndTopRoute =
		selectedRoute && normalizedRoutes
			? Number((100 - (selectedRoute.amount / normalizedRoutes[0].amount) * 100).toFixed(2))
			: 0;

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
	const onChainChange = (newChain) => {
		setAggregator(null);
		setAmount(['10', '']);
		router
			.push(
				{
					pathname: '/',
					query: { chain: newChain.value, from: ethers.constants.AddressZero }
				},
				undefined,
				{ shallow: true }
			)
			.then(() => {
				if (switchNetwork) switchNetwork(newChain.chainId);
			});
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

	useEffect(() => {
		const isUnknown =
			selectedToToken === null &&
			finalSelectedToToken !== null &&
			savedTokens &&
			!savedTokens.find(({ address }) => address.toLowerCase() === toTokenAddress.toLowerCase());

		if (isUnknown && toTokenAddress && savedTokens?.length > 1) {
			onToTokenChange(undefined);
		}
	}, [router?.query, savedTokens]);

	useEffect(() => {
		if (selectedRoute) {
			if (
				lastOutputValue !== null &&
				aggregator === lastOutputValue.aggregator &&
				selectedRoute.amount / lastOutputValue.amount <= 0.94 // >=6% drop
			) {
				setAggregator(null);
			}
			setLastOutputValue({
				aggregator,
				amount: selectedRoute.amount
			});
		}
	}, [selectedRoute?.amount, aggregator]);

	const priceImpactRoute = selectedRoute ? fillRoute(selectedRoute) : null;

	const hasLinearPriceImpact =
		selectedRoute && (halfAmountRoutes || []).length
			? BigNumber(selectedRoute?.price?.amountReturned)
					.div(BigNumber((halfAmountRoutes || [])[0]?.price?.amountReturned || selectedRoute?.price?.amountReturned))
					.lt(1.5)
			: false;

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
		selectedRoutesPriceImpact === null ||
		Number(selectedRoutesPriceImpact) > PRICE_IMPACT_WARNING_THRESHOLD ||
		hasLinearPriceImpact;
	const hasMaxPriceImpact = selectedRoutesPriceImpact !== null && Number(selectedRoutesPriceImpact) > 30;

	const insufficientBalance =
		balance.isSuccess &&
		balance.data &&
		!Number.isNaN(Number(balance.data.formatted)) &&
		balance.data.value &&
		selectedRoute
			? +selectedRoute?.fromAmount > +balance.data.value
			: false;

	const slippageIsWorng = Number.isNaN(Number(slippage)) || slippage === '';

	const forceRefreshTokenBalance = () => {
		if (chainOnWallet && address) {
			balance?.refetch() ||
				wagmiClient.invalidateQueries([{ addressOrName: address, chainId: chainOnWallet.id, entity: 'balance' }]);
		}
	};

	// approve/swap tokens
	const amountToApprove =
		amountOut && amountOut !== ''
			? BigNumber(selectedRoute?.fromAmount)
					.times(100 + Number(slippage) * 2)
					.div(100)
					.toFixed(0)
			: selectedRoute?.fromAmount;
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
	} = useTokenApprove(
		finalSelectedFromToken?.address as `0x${string}`,
		selectedRoute && selectedRoute.price ? selectedRoute.price.tokenApprovalAddress : null,
		amountToApprove
	);

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
						chain: selectedChain.value,
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
			const balanceBefore = toTokenBalance?.data?.formatted;

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
						toast(formatErrorToast({}, true));
					}
				})
				.catch(() => {
					isError = true;
					toast(formatErrorToast({}, true));
				})
				?.finally(() => {
					getBalance({ address, chainId: selectedChain.id, token: finalSelectedToToken.address }).then((balanceAfter) =>
						sendSwapEvent({
							chain: selectedChain.value,
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
							route: variables.route,
							reportedOutput: Number(variables.amount) || 0,
							realOutput: Number(balanceAfter?.formatted) - Number(balanceBefore) || 0
						})
					);
				});
		},
		onError: (err: { reason: string; code: string }, variables) => {
			if (err.code !== 'ACTION_REJECTED' || err.code.toString() === '-32603') {
				toast(formatErrorToast(err, false));

				sendSwapEvent({
					chain: selectedChain.value,
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
		if (selectedRoute && selectedRoute.price && !slippageIsWorng) {
			if (hasMaxPriceImpact && !isDegenModeEnabled) {
				toast({
					title: 'Price impact is too high!',
					description: 'Swap is blocked, please try another route.',
					status: 'error'
				});
				return;
			}
			swapMutation.mutate({
				chain: selectedChain.value,
				from: finalSelectedFromToken.value,
				to: finalSelectedToToken.value,
				signer,
				slippage,
				adapter: selectedRoute.name,
				rawQuote: selectedRoute.price.rawQuote,
				tokens: { fromToken: finalSelectedFromToken, toToken: finalSelectedToToken },
				index: selectedRoute.index,
				route: selectedRoute,
				amount: selectedRoute.amount,
				amountIn: selectedRoute.amountIn
			});
		}
	};

	const pairSandwichData =
		sandwichList?.[selectedChain?.value]?.[
			normalizeTokens(
				finalSelectedFromToken?.address === ethers.constants.AddressZero
					? WETH[selectedChain?.value]
					: finalSelectedFromToken?.address,
				finalSelectedToToken?.address === ethers.constants.AddressZero
					? WETH[selectedChain?.value]
					: finalSelectedToToken?.address
			).join('')
		];

	const isAmountSynced = debouncedAmount === formatAmount(amount) && formatAmount(amountOut) === debouncedAmountOut;
	const isUnknownPrice = !fromTokenPrice || !toTokenPrice;
	const isPriceImpactNotKnown = !selectedRoutesPriceImpact && selectedRoutesPriceImpact !== 0;

	const warnings = [
		aggregator === 'CowSwap' ? (
			<>
				{finalSelectedFromToken.value === ethers.constants.AddressZero && Number(slippage) < 2 ? (
					<Alert status="warning" borderRadius="0.375rem" py="8px" key="cow1">
						<AlertIcon />
						Swaps from {finalSelectedFromToken.symbol} on CowSwap need to have slippage higher than 2%.
					</Alert>
				) : null}
				<Alert status="warning" borderRadius="0.375rem" py="8px" key="cow2">
					<AlertIcon />
					CowSwap orders are fill-or-kill, so they may not execute if price moves quickly against you.
					{finalSelectedFromToken.value === ethers.constants.AddressZero ? (
						<>
							<br /> For ETH orders, if it doesn't get executed the ETH will be returned to your wallet in 30 minutes.
						</>
					) : null}
				</Alert>
			</>
		) : null,
		diffBetweenSelectedRouteAndTopRoute > 5 && (
			<Alert status="warning" borderRadius="0.375rem" py="8px" key="diff">
				<AlertIcon />
				{`There is ${diffBetweenSelectedRouteAndTopRoute}% difference between selected route and top route.`}
			</Alert>
		),
		!isLoading && !isPriceImpactNotKnown && selectedRoutesPriceImpact >= PRICE_IMPACT_WARNING_THRESHOLD ? (
			<Alert status="warning" borderRadius="0.375rem" py="8px" key="impact">
				<AlertIcon />
				High price impact! More than {selectedRoutesPriceImpact.toFixed(2)}% drop.
			</Alert>
		) : null,
		!isLoading && toTokenPrice && Number(selectedRoute?.amount) * toTokenPrice > 100e3 ? (
			<Alert status="warning" borderRadius="0.375rem" py="8px" key="size">
				<AlertIcon />
				Your size is size. Please be mindful of slippage
			</Alert>
		) : null,
		pairSandwichData ? <Sandwich sandiwichData={pairSandwichData} key="sandwich" /> : null
	].filter(Boolean);

	return (
		<Wrapper>
			{isSettingsModalOpen ? (
				<Settings
					adapters={adaptersNames}
					disabledAdapters={disabledAdapters}
					setDisabledAdapters={setDisabledAdapters}
					onClose={() => setSettingsModalOpen(false)}
				/>
			) : null}

			<Text fontSize="1rem" fontWeight="500" display={{ base: 'none', md: 'block', lg: 'block' }}>
				This product is still in beta. If you run into any issue please let us know in our{' '}
				<a
					style={{ textDecoration: 'underline' }}
					target={'_blank'}
					rel="noreferrer noopener"
					href="https://discord.swap.defillama.com/"
				>
					discord server
				</a>
			</Text>

			<BodyWrapper>
				<Body>
					<div>
						<FormHeader>
							<Flex>
								<Box>Chain</Box>
								<Spacer />
								<Tooltip content="Redirect requests through the DefiLlama Server to hide your IP address">
									<FormControl display="flex" alignItems="baseline" gap="6px" justifyContent={'center'}>
										<FormLabel htmlFor="privacy-switch" margin={0} fontSize="14px" color="gray.400">
											Hide IP
										</FormLabel>
										<Switch
											id="privacy-switch"
											onChange={(e) => setIsPrivacyEnabled(e?.target?.checked)}
											isChecked={isPrivacyEnabled}
										/>
									</FormControl>
								</Tooltip>
								<SettingsIcon onClick={() => setSettingsModalOpen((open) => !open)} ml={4} mt={1} cursor="pointer" />
								{isSmallScreen && finalSelectedFromToken && finalSelectedToToken ? (
									<ArrowForwardIcon
										width={'24px'}
										height={'24px'}
										ml="16px"
										cursor={'pointer'}
										onClick={() => setUiState(STATES.ROUTES)}
									/>
								) : null}
							</Flex>
						</FormHeader>

						<ReactSelect options={chains} value={selectedChain} onChange={onChainChange} />
					</div>

					<Flex flexDir="column" gap="4px" pos="relative">
						<InputAmountAndTokenSelect
							placeholder={normalizedRoutes[0]?.amountIn}
							setAmount={setAmount}
							type="amountIn"
							amount={selectedRoute?.amountIn && amountOut !== '' ? selectedRoute.amountIn : amount}
							tokens={fromTokensList}
							token={finalSelectedFromToken}
							onSelectTokenChange={onFromTokenChange}
							selectedChain={selectedChain}
							balance={balance.data?.formatted}
							onMaxClick={onMaxClick}
							tokenPrice={fromTokenPrice}
						/>

						<IconButton
							onClick={() =>
								router.push(
									{
										pathname: router.pathname,
										query: { ...router.query, to: finalSelectedFromToken?.address, from: finalSelectedToToken?.address }
									},
									undefined,
									{ shallow: true }
								)
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
							selectedChain={selectedChain}
							balance={toTokenBalance.data?.formatted}
							tokenPrice={toTokenPrice}
							priceImpact={selectedRoutesPriceImpact}
						/>
					</Flex>

					<Slippage
						slippage={slippage}
						setSlippage={setSlippage}
						fromToken={finalSelectedFromToken?.symbol}
						toToken={finalSelectedToToken?.symbol}
					/>

					<PriceImpact
						isLoading={isLoading || fetchingTokenPrices}
						fromTokenPrice={fromTokenPrice}
						fromToken={finalSelectedFromToken}
						toTokenPrice={toTokenPrice}
						toToken={finalSelectedToToken}
						amountReturnedInSelectedRoute={
							priceImpactRoute && priceImpactRoute.price && priceImpactRoute.price.amountReturned
						}
						selectedRoutesPriceImpact={selectedRoutesPriceImpact}
						amount={selectedRoute?.amountIn}
						slippage={slippage}
						isPriceImpactNotKnown={isPriceImpactNotKnown}
						hasLinearPriceImpact={hasLinearPriceImpact}
					/>
					<Box display={['none', 'none', 'flex', 'flex']} flexDirection="column" gap="4px">
						{warnings}
					</Box>

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
						) : !selectedRoute && isSmallScreen && finalSelectedFromToken && finalSelectedToToken ? (
							<Button colorScheme={'messenger'} onClick={() => setUiState(STATES.ROUTES)}>
								Select Aggregator
							</Button>
						) : hasMaxPriceImpact && !isDegenModeEnabled ? (
							<Button colorScheme={'messenger'} disabled>
								Price impact is too large
							</Button>
						) : (
							<>
								{router && address && (
									<>
										<>
											{isUSDTNotApprovedOnEthereum && (
												<Flex flexDir="column" gap="4px" w="100%">
													<Text fontSize="0.75rem" fontWeight={400}>
														{`${
															finalSelectedFromToken?.symbol
														} uses an old token implementation that requires resetting approvals if there's a
														previous approval, and you currently have an approval for ${(
															Number(allowance) /
															10 ** finalSelectedFromToken?.decimals
														).toFixed(2)} ${finalSelectedFromToken?.symbol} for this contract, you
														need to reset your approval and approve again`}
													</Text>
													<Button
														isLoading={isApproveResetLoading}
														loadingText={isConfirmingResetApproval ? 'Confirming' : 'Preparing transaction'}
														colorScheme={'messenger'}
														onClick={() => {
															if (approveReset) approveReset();
														}}
														disabled={isApproveResetLoading || !selectedRoute}
													>
														Reset Approval
													</Button>
												</Flex>
											)}

											{(hasPriceImapct || isUnknownPrice) && !isLoading && selectedRoute && isApproved ? (
												<SwapConfirmation
													isUnknownPrice={isUnknownPrice}
													isMaxPriceImpact={hasMaxPriceImpact}
													handleSwap={handleSwap}
													isDegenModeEnabled={isDegenModeEnabled}
												/>
											) : (
												<Button
													isLoading={swapMutation.isLoading || isApproveLoading}
													loadingText={isConfirmingApproval ? 'Confirming' : 'Preparing transaction'}
													colorScheme={'messenger'}
													onClick={() => {
														//scroll Routes into view
														!selectedRoute && routesRef.current.scrollIntoView({ behavior: 'smooth' });

														if (approve) approve();

														if (
															balance.data &&
															!Number.isNaN(Number(balance.data.value)) &&
															+selectedRoute?.fromAmount > +balance?.data?.value?.toString()
														)
															return;

														if (isApproved) handleSwap();
													}}
													disabled={
														isUSDTNotApprovedOnEthereum ||
														swapMutation.isLoading ||
														isApproveLoading ||
														isApproveResetLoading ||
														!(finalSelectedFromToken && finalSelectedToToken) ||
														insufficientBalance ||
														!selectedRoute ||
														slippageIsWorng ||
														!isAmountSynced
													}
												>
													{!selectedRoute
														? 'Select Aggregator'
														: isApproved
														? `Swap via ${selectedRoute.name}`
														: slippageIsWorng
														? 'Set Slippage'
														: 'Approve'}
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
														!selectedRoute
													}
												>
													{'Approve Infinite'}
												</Button>
											)}

											{isSmallScreen && warnings?.length ? (
												<Popover>
													<PopoverTrigger>
														<Button backgroundColor={'rgb(224, 148, 17)'} maxWidth="100px">
															{warnings.length} Warning{warnings.length === 1 ? '' : 's'}
														</Button>
													</PopoverTrigger>
													<PopoverContent mr="8">{warnings}</PopoverContent>
												</Popover>
											) : null}
										</>
									</>
								)}
							</>
						)}
					</SwapWrapper>
				</Body>

				<Routes ref={routesRef} visible={uiState === STATES.ROUTES}>
					<ArrowBackIcon
						width={'24px'}
						height="24px"
						position={'absolute'}
						mb="4px"
						onClick={() => setUiState(STATES.INPUT)}
						display={['flex', 'flex', 'none', 'none']}
						cursor="pointer"
					/>
					{normalizedRoutes?.length ? (
						<Flex alignItems="center" justifyContent="space-between">
							<FormHeader> Select a route to perform a swap </FormHeader>
							<Tooltip2
								content={`Displayed data will auto-refresh after ${secondsToRefresh} seconds. Click here to update manually`}
							>
								<RepeatIcon pos="absolute" w="16px	" h="16px" mt="4px" ml="4px" />
								<CircularProgress
									value={100 - (secondsToRefresh / (REFETCH_INTERVAL / 1000)) * 100}
									color="blue.400"
									onClick={refetch}
									size="24px"
									as="button"
								/>
							</Tooltip2>
						</Flex>
					) : !isLoading &&
					  amount &&
					  debouncedAmount &&
					  amount === debouncedAmount &&
					  finalSelectedFromToken &&
					  finalSelectedToToken &&
					  routes &&
					  routes.length ? (
						<FormHeader>No available routes found</FormHeader>
					) : null}
					<Box display={{ base: 'none', md: 'block', lg: 'block' }}>
						<span style={{ fontSize: '12px', color: '#999999', marginLeft: '4px', marginTop: '4px', display: 'flex' }}>
							{normalizedRoutes?.length ? `Best route is selected based on net output after gas fees.` : null}
						</span>

						<span style={{ fontSize: '12px', color: '#999999', marginLeft: '4px', marginTop: '4px', display: 'flex' }}>
							{failedRoutes.length > 0
								? `Routes for aggregators ${failedRoutes
										.map((r) => r.name)
										.join(', ')} have been hidden since they could not be executed`
								: null}
						</span>
					</Box>

					{isLoading &&
					(debouncedAmount || debouncedAmountOut) &&
					finalSelectedFromToken &&
					finalSelectedToToken &&
					!(disabledAdapters.length === adaptersNames.length) ? (
						<Loader />
					) : (!debouncedAmount && !debouncedAmountOut) ||
					  !finalSelectedFromToken ||
					  !finalSelectedToToken ||
					  !router.isReady ||
					  disabledAdapters.length === adaptersNames.length ? (
						<RoutesPreview />
					) : null}

					{normalizedRoutes.map((r, i) => (
						<Fragment
							key={
								selectedChain.label +
								finalSelectedFromToken.label +
								finalSelectedToToken.label +
								amountWithDecimals +
								gasPriceData?.formatted?.gasPrice +
								r?.name
							}
						>
							<SwapRoute
								{...r}
								index={i}
								selected={aggregator === r.name}
								setRoute={() => {
									if (isSmallScreen) toggleUi();
									setAggregator(r.name);
								}}
								toToken={finalSelectedToToken}
								amountFrom={r?.fromAmount}
								fromToken={finalSelectedFromToken}
								selectedChain={selectedChain.label}
								gasTokenPrice={gasTokenPrice}
								toTokenPrice={toTokenPrice}
								isFetchingGasPrice={fetchingTokenPrices}
								amountOut={amountOutWithDecimals}
								amountIn={r?.amountIn}
							/>

							{aggregator === r.name && (
								<SwapUnderRoute>
									{!isConnected ? (
										<ConnectButtonWrapper>
											<ConnectButton />
										</ConnectButtonWrapper>
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
																	{`${
																		finalSelectedFromToken?.symbol
																	} uses an old token implementation that requires resetting approvals if there's a
																		previous approval, and you currently have an approval for ${(
																			Number(allowance) /
																			10 ** finalSelectedFromToken?.decimals
																		).toFixed(2)} ${finalSelectedFromToken?.symbol} for this contract, you
																		need to reset your approval and approve again`}
																</Text>
																<Button
																	isLoading={isApproveResetLoading}
																	loadingText={isConfirmingResetApproval ? 'Confirming' : 'Preparing transaction'}
																	colorScheme={'messenger'}
																	onClick={() => {
																		if (approveReset) approveReset();
																	}}
																	disabled={isApproveResetLoading || !selectedRoute}
																>
																	Reset Approval
																</Button>
															</Flex>
														)}

														{(hasPriceImapct || isUnknownPrice) && !isLoading && selectedRoute && isApproved ? (
															<SwapConfirmation
																isUnknownPrice={isUnknownPrice}
																handleSwap={handleSwap}
																isMaxPriceImpact={hasMaxPriceImpact}
															/>
														) : (
															<Button
																isLoading={swapMutation.isLoading || isApproveLoading}
																loadingText={isConfirmingApproval ? 'Confirming' : 'Preparing transaction'}
																colorScheme={'messenger'}
																onClick={() => {
																	if (approve) approve();

																	if (
																		balance.data &&
																		!Number.isNaN(Number(balance.data.formatted)) &&
																		+selectedRoute.amountIn > +balance.data.formatted
																	)
																		return;

																	if (isApproved) handleSwap();
																}}
																disabled={
																	isUSDTNotApprovedOnEthereum ||
																	swapMutation.isLoading ||
																	isApproveLoading ||
																	isApproveResetLoading ||
																	!selectedRoute ||
																	slippageIsWorng ||
																	!isAmountSynced
																}
															>
																{!selectedRoute
																	? 'Select Aggregator'
																	: isApproved
																	? `Swap via ${selectedRoute?.name}`
																	: slippageIsWorng
																	? 'Set Slippage'
																	: 'Approve'}
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
																	!selectedRoute
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
								</SwapUnderRoute>
							)}
						</Fragment>
					))}

					{normalizedRoutes.length > 0
						? loadingRoutes.map((r) => (
								<Fragment
									key={
										'fetching quote' +
										selectedChain?.label +
										finalSelectedFromToken?.label +
										finalSelectedToToken?.label +
										amountWithDecimals +
										gasPriceData?.formatted?.gasPrice +
										r[0]
									}
								>
									<LoadingRoute name={r[0] as string} />
								</Fragment>
						  ))
						: null}
				</Routes>
			</BodyWrapper>

			{window === parent ? <FAQs /> : null}

			<TransactionModal open={txModalOpen} setOpen={setTxModalOpen} link={txUrl} />
		</Wrapper>
	);
}
