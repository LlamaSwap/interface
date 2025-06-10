import { useRef, useState, Fragment, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAccount, useCapabilities, useSwitchChain } from 'wagmi';
import { useAddRecentTransaction, useConnectModal } from '@rainbow-me/rainbowkit';
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
	useBreakpoint,
	Popover,
	PopoverTrigger,
	PopoverContent
} from '@chakra-ui/react';
import ReactSelect from '~/components/MultiSelect';
import FAQs from '~/components/FAQs';
import SwapRoute, { LoadingRoute } from '~/components/SwapRoute';
import { adaptersNames, getAllChains, swap, gaslessApprove } from './router';
import { inifiniteApprovalAllowed } from './list';
import Loader from './Loader';
import { useTokenApprove } from './hooks';
import { IRoute, useGetRoutes } from '~/queries/useGetRoutes';
import { useGetPrice } from '~/queries/useGetPrice';
import { PRICE_IMPACT_WARNING_THRESHOLD } from './constants';
import Tooltip, { Tooltip2 } from '../Tooltip';
import type { IToken } from '~/types';
import { sendSwapEvent } from './adapters/utils';
import { useRouter } from 'next/router';
import { TransactionModal } from '../TransactionModal';
import RoutesPreview from './RoutesPreview';
import {
	formatSuccessToast,
	formatErrorToast,
	formatSubmittedToast,
	formatUnknownErrorToast
} from '~/utils/formatToast';
import { useDebounce } from '~/hooks/useDebounce';
import { useGetSavedTokens } from '~/queries/useGetSavedTokens';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useLocalStorage } from '~/hooks/useLocalStorage';
import SwapConfirmation from './SwapConfirmation';
import { getTokenBalance, useBalance } from '~/queries/useBalance';
import { useEstimateGas } from './hooks/useEstimateGas';
import { Slippage } from '../Slippage';
import { PriceImpact } from '../PriceImpact';
import { useQueryParams } from '~/hooks/useQueryParams';
import { useSelectedChainAndTokens } from '~/hooks/useSelectedChainAndTokens';
import { InputAmountAndTokenSelect } from '../InputAmountAndTokenSelect';
import { ArrowBackIcon, ArrowForwardIcon, RepeatIcon, SettingsIcon } from '@chakra-ui/icons';
import { Settings } from './Settings';
import { formatAmount } from '~/utils/formatAmount';
import { RefreshIcon } from '../RefreshIcon';
import { zeroAddress } from 'viem';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { config } from '../WalletProvider';

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

	box-shadow: 10px 0px 50px 10px rgba(26, 26, 26, 0.9);

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
	margin: 0px auto 40px;
	position: relative;

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

	box-shadow: 10px 0px 50px 10px rgba(26, 26, 26, 0.9);

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
	min-height: initial;
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

export const SwapInputArrow = (props) => (
	<IconButton
		icon={<ArrowDown size={14} />}
		aria-label="Switch Tokens"
		w="2.25rem"
		h="2.25rem"
		minW={0}
		p="0"
		pos="absolute"
		top="0"
		bottom="-36px"
		right="0"
		left="0"
		m="auto"
		borderRadius="8px"
		border="4px solid #222429"
		bg="#141619"
		_hover={{ bg: '#2d3037' }}
		color="white"
		zIndex={1}
		{...props}
	/>
);

interface IFinalRoute extends IRoute {
	isFailed: boolean;
	route: IRoute;
	gasUsd: string | number;
	amountUsd: string | null;
	amount: number;
	netOut: number;
	amountIn: string;
	amountInUsd: string | null;
}

const chains = getAllChains();

export function AggregatorContainer() {
	// wallet stuff
	const { address, isConnected, chain: chainOnWallet } = useAccount();
	const { openConnectModal } = useConnectModal();
	const { switchChain } = useSwitchChain();
	const addRecentTransaction = useAddRecentTransaction();

	// swap input fields and selected aggregator states
	const [aggregator, setAggregator] = useState<string | null>(null);
	const [isPrivacyEnabled, setIsPrivacyEnabled] = useLocalStorage('llamaswap-isprivacyenabled', false);
	const [[amount, amountOut], setAmount] = useState<[number | string, number | string]>(['', '']);

	const [slippage, setSlippage] = useLocalStorage('llamaswap-slippage', '0.3');
	const [lastOutputValue, setLastOutputValue] = useState<{ aggregator: string; amount: number } | null>(null);
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
	const debouncedAmountInAndOut = useDebounce(`${formatAmount(amount)}&&${formatAmount(amountOut)}`, 300);
	const [debouncedAmount, debouncedAmountOut] = debouncedAmountInAndOut.split('&&');

	// get selected chain and tokens from URL query params
	const routesRef = useRef<HTMLDivElement>(null);
	const router = useRouter();

	const { toTokenAddress } = useQueryParams();
	const { selectedChain, selectedToToken, finalSelectedFromToken, finalSelectedToToken } = useSelectedChainAndTokens();
	const isValidSelectedChain = selectedChain && chainOnWallet ? selectedChain.id === chainOnWallet.id : false;
	const isOutputTrade = amountOut && amountOut !== '';

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
	const balance = useBalance({ address, token: finalSelectedFromToken?.address, chainId: selectedChain?.id });

	// selected from token's balances
	const toTokenBalance = useBalance({ address, token: finalSelectedToToken?.address, chainId: selectedChain?.id });

	const { data: tokenPrices, isLoading: fetchingTokenPrices } = useGetPrice({
		chain: selectedChain?.value,
		toToken: finalSelectedToToken?.address,
		fromToken: finalSelectedFromToken?.address
	});

	const { gasTokenPrice, toTokenPrice, fromTokenPrice, gasPriceData } = tokenPrices || {};

	const {
		data: routes = [],
		isLoading,
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
			userAddress: address || zeroAddress,
			amount: debouncedAmount,
			fromToken: finalSelectedFromToken,
			toToken: finalSelectedToToken,
			slippage,
			isPrivacyEnabled,
			amountOut: amountOutWithDecimals
		}
	});

	const { data: gasData } = useEstimateGas({
		routes,
		token: finalSelectedFromToken?.address,
		userAddress: address,
		chain: selectedChain?.value,
		balance: balance?.data?.value ? Number(balance.data.value) : null,
		isOutput: amountOut && amountOut !== '' ? true : false
	});

	// format routes
	const fillRoute = (route: IRoute) => {
		if (!route.price || !finalSelectedFromToken || !finalSelectedToToken) return null;

		const gasEstimation = gasData?.[route.name]?.gas ?? route.price.estimatedGas;

		let gasUsd: number | string = gasPriceData?.gasPrice
			? ((gasTokenPrice ?? 0) * gasEstimation * gasPriceData.gasPrice) / 1e18 || 0
			: 0;

		// CowSwap native token swap
		gasUsd =
			route.price.feeAmount && finalSelectedFromToken.address === zeroAddress
				? (route.price.feeAmount / 1e18) * (gasTokenPrice ?? 0) + gasUsd
				: gasUsd;

		gasUsd = route.l1Gas !== 'Unknown' && route.l1Gas ? route.l1Gas * (gasTokenPrice ?? 0) + gasUsd : gasUsd;

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
			gasUsd: gasUsd === 0 && route.name !== 'CowSwap' && !route.isGasless ? 'Unknown' : gasUsd,
			amountUsd,
			amount,
			netOut,
			amountIn,
			amountInUsd
		} as IFinalRoute;
	};

	const allRoutes = [...(routes || [])].map(fillRoute).filter((r) => (r ? true : false)) as Array<IFinalRoute>;
	const failedRoutes = allRoutes.filter((r) => r!.isFailed === true);

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
		selectedRoute?.amount && normalizedRoutes?.[0]?.amount
			? Number((100 - (selectedRoute.amount / normalizedRoutes[0].amount) * 100).toFixed(2))
			: 0;

	// functions to handle change in swap input fields
	const onMaxClick = () => {
		if (balance.data && balance.data.formatted && !Number.isNaN(Number(balance.data.formatted))) {
			if (
				selectedRoute?.price?.estimatedGas &&
				gasPriceData?.gasPrice &&
				finalSelectedFromToken?.address === zeroAddress
			) {
				const gas = (+selectedRoute.price!.estimatedGas * gasPriceData.gasPrice * 2) / 1e18;

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
					query: { ...router.query, chain: newChain.value, from: zeroAddress, to: undefined }
				},
				undefined,
				{ shallow: true }
			)
			.then(() => {
				if (switchChain) switchChain({ chainId: newChain.chainId });
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
			toTokenAddress &&
			!savedTokens[toTokenAddress.toLowerCase()];

		if (isUnknown && toTokenAddress && savedTokens?.length > 1) {
			onToTokenChange(undefined);
		}
	}, [router?.query, savedTokens]);

	useEffect(() => {
		if (selectedRoute?.amount && aggregator) {
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

	const selectedRoutesPriceImpact =
		fromTokenPrice &&
		toTokenPrice &&
		selectedRoute &&
		selectedRoute.amountUsd &&
		selectedRoute.amountInUsd &&
		(debouncedAmount || debouncedAmountOut) &&
		!Number.isNaN(Number(selectedRoute.amountUsd))
			? 100 - (Number(selectedRoute.amountUsd) / Number(selectedRoute.amountInUsd)) * 100
			: null;

	const hasPriceImapct =
		selectedRoutesPriceImpact === null || Number(selectedRoutesPriceImpact) > PRICE_IMPACT_WARNING_THRESHOLD;
	const hasMaxPriceImpact = selectedRoutesPriceImpact !== null && Number(selectedRoutesPriceImpact) > 30;

	const insufficientBalance =
		balance.isSuccess &&
		balance.data &&
		!Number.isNaN(Number(balance.data.formatted)) &&
		balance.data.value &&
		selectedRoute?.fromAmount
			? +selectedRoute.fromAmount > Number(balance.data.value)
			: false;

	const slippageIsWorng = Number.isNaN(Number(slippage)) || slippage === '';

	const forceRefreshTokenBalance = () => {
		if (chainOnWallet && address) {
			balance?.refetch();
			toTokenBalance?.refetch();
		}
	};

	// approve/swap tokens
	const amountToApprove =
		amountOut && amountOut !== '' && selectedRoute?.fromAmount
			? BigNumber(selectedRoute.fromAmount)
					.times(100 + Number(slippage) * 2)
					.div(100)
					.toFixed(0)
			: selectedRoute?.fromAmount;

	const isGaslessApproval = selectedRoute?.price?.isGaslessApproval ?? false;

	const {
		isApproved: isTokenApproved,
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
		allowance,
		errorFetchingAllowance,
		refetch: refetchTokenAllowance
	} = useTokenApprove({
		token: finalSelectedFromToken?.address as `0x${string}`,
		spender:
			selectedRoute && selectedRoute.price && !isGaslessApproval ? selectedRoute.price.tokenApprovalAddress : null,
		amount: amountToApprove,
		chain: selectedChain?.value
	});

	const gaslessApprovalMutation = useMutation({
		mutationFn: (params: { adapter: string; rawQuote: any; isInfiniteApproval: boolean }) => gaslessApprove(params)
	});

	const { data: capabilities } = useCapabilities();

	const isEip5792 =
		selectedChain && capabilities?.[selectedChain.id]?.atomic?.status
			? capabilities[selectedChain.id].atomic!.status === 'supported'
			: false;

	const isApproved =
		selectedRoute?.price && selectedRoute?.isGasless
			? (selectedRoute.price.rawQuote as any).approval.isRequired
				? (selectedRoute.price.rawQuote as any).approval.isGaslessAvailable
					? gaslessApprovalMutation.data
						? true
						: false
					: isTokenApproved
				: true
			: isEip5792
				? true
				: isTokenApproved;

	const isUSDTNotApprovedOnEthereum = isEip5792
		? false
		: selectedChain && finalSelectedFromToken && selectedChain.id === 1 && shouldRemoveApproval
			? true
			: false;

	const swapMutation = useMutation({
		mutationFn: (params: {
			chain: string;
			from: string;
			to: string;
			amount: string | number;
			fromAmount: string | number;
			amountIn: string;
			adapter: string;
			fromAddress: string;
			slippage: string;
			rawQuote: any;
			tokens: { toToken: IToken; fromToken: IToken };
			index: number;
			route: any;
			approvalData: any;
			eip5792: { shouldRemoveApproval: boolean; isTokenApproved: boolean } | null;
		}) => swap(params),
		onSuccess: (data, variables) => {
			let txUrl;
			if (typeof data !== 'string' && data.gaslessTxReceipt) {
				gaslessApprovalMutation.reset();
				const isSuccess =
					data.gaslessTxReceipt.status === 'confirmed' ||
					data.gaslessTxReceipt.status === 'submitted' ||
					data.gaslessTxReceipt.status === 'succeeded';
				if (isSuccess) {
					toast(formatSuccessToast(variables));
					const transactions = data.gaslessTxReceipt.transactions;
					const hash = transactions[transactions.length - 1]?.hash;
					if (hash) {
						addRecentTransaction({
							hash: hash,
							description: `Swap transaction using ${variables.adapter} is sent.`
						});
						if (chainOnWallet?.blockExplorers) {
							const explorerUrl = chainOnWallet.blockExplorers.default.url;
							setTxModalOpen(true);
							txUrl = `${explorerUrl}/tx/${hash}`;
							setTxUrl(txUrl);
						}
					}
				} else if (data.gaslessTxReceipt.status === 'pending') {
					toast(formatSubmittedToast(variables));
				} else {
					toast(formatErrorToast({ reason: data.gaslessTxReceipt.reason }, false));
				}
				forceRefreshTokenBalance();

				sendSwapEvent({
					chain: selectedChain?.value ?? 'unknown',
					user: address ?? 'unknown',
					from: variables.from,
					to: variables.to,
					aggregator: variables.adapter,
					isError: isSuccess || data.gaslessTxReceipt.status === 'pending',
					quote: variables.rawQuote,
					txUrl,
					amount: String(variables.amountIn),
					amountUsd: fromTokenPrice ? +fromTokenPrice * +variables.amountIn || 0 : null,
					errorData: data,
					slippage,
					routePlace: String(variables?.index),
					route: variables.route
				});

				return;
			}

			if (typeof data === 'string') {
				addRecentTransaction({
					hash: data,
					description: `Swap transaction using ${variables.adapter} is sent.`
				});
				if (chainOnWallet?.blockExplorers) {
					const explorerUrl = chainOnWallet.blockExplorers.default.url;
					setTxModalOpen(true);
					txUrl = `${explorerUrl}/tx/${data}`;
					setTxUrl(txUrl);
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

				waitForTransactionReceipt(config, {
					hash: data as `0x${string}`
				})
					.then((final) => {
						if (final.status === 'success') {
							forceRefreshTokenBalance();

							if (confirmingTxToastRef.current) {
								toast.close(confirmingTxToastRef.current);
							}

							toast(formatSuccessToast(variables));

							setAmount(['', '']);
						} else {
							isError = true;
							toast(formatErrorToast({}, true));
						}
					})
					?.catch(() => {
						isError = true;
						toast(formatErrorToast({}, true));
					})
					?.finally(() => {
						if (selectedChain && finalSelectedToToken && address) {
							getTokenBalance({ address, chainId: selectedChain.id, token: finalSelectedToToken.address }).then(
								(balanceAfter) =>
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
										amountUsd: fromTokenPrice ? +fromTokenPrice * +variables.amountIn || 0 : null,
										errorData: {},
										slippage,
										routePlace: String(variables?.index),
										route: variables.route,
										reportedOutput: Number(variables.amount) || 0,
										realOutput: Number(balanceAfter?.formatted) - Number(balanceBefore) || 0
									})
							);
						}
					});
			} else if (typeof data === 'object' && data.id) {
				//eip5792
				console.log({ data });
			} else {
				setTxModalOpen(true);
				txUrl = `https://explorer.cow.fi/orders/${data.id}`;
				setTxUrl(txUrl);
				data.waitForOrder(() => {
					forceRefreshTokenBalance();

					toast(formatSuccessToast(variables));

					sendSwapEvent({
						chain: selectedChain?.value ?? 'unknown',
						user: address ?? 'unknown',
						from: variables.from,
						to: variables.to,
						aggregator: variables.adapter,
						isError: false,
						quote: variables.rawQuote,
						txUrl,
						amount: String(variables.amountIn),
						amountUsd: fromTokenPrice ? +fromTokenPrice * +variables.amountIn || 0 : null,
						errorData: {},
						slippage,
						routePlace: String(variables?.index),
						route: variables.route
					});
				});
			}
		},
		onError: (err: { reason: string; code: string }, variables) => {
			if (err.code !== 'ACTION_REJECTED' || err.code.toString() === '-32603') {
				toast(formatErrorToast(err, false));

				sendSwapEvent({
					chain: selectedChain?.value ?? 'unknown',
					user: address ?? 'unknown',
					from: variables.from,
					to: variables.to,
					aggregator: variables.adapter,
					isError: true,
					quote: variables.rawQuote,
					txUrl: '',
					amount: String(variables.amountIn),
					amountUsd: fromTokenPrice ? +fromTokenPrice * +variables.amountIn || 0 : null,
					errorData: err,
					slippage,
					routePlace: String(variables?.index),
					route: variables.route
				});
			}
		}
	});

	const handleSwap = () => {
		if (
			selectedRoute &&
			selectedRoute.price &&
			!slippageIsWorng &&
			selectedChain &&
			finalSelectedFromToken &&
			finalSelectedToToken &&
			address
		) {
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
				fromAddress: address,
				slippage,
				adapter: selectedRoute.name,
				rawQuote: selectedRoute.price.rawQuote,
				tokens: { fromToken: finalSelectedFromToken, toToken: finalSelectedToToken },
				index: selectedRoute.index,
				route: selectedRoute,
				amount: selectedRoute.amount,
				amountIn: selectedRoute.amountIn,
				fromAmount: selectedRoute.fromAmount,
				approvalData: gaslessApprovalMutation?.data ?? {},
				eip5792: isEip5792 ? { shouldRemoveApproval: shouldRemoveApproval ? true : false, isTokenApproved } : null
			});
		}
	};

	const handleGaslessApproval = ({ isInfiniteApproval }: { isInfiniteApproval: boolean }) => {
		if (selectedRoute?.price) {
			gaslessApprovalMutation.mutate({
				adapter: selectedRoute.name,
				rawQuote: selectedRoute.price.rawQuote,
				isInfiniteApproval
			});
		}
	};

	const isAmountSynced = debouncedAmount === formatAmount(amount) && formatAmount(amountOut) === debouncedAmountOut;
	const isUnknownPrice = !fromTokenPrice || !toTokenPrice;
	const isPriceImpactNotKnown = !selectedRoutesPriceImpact && selectedRoutesPriceImpact !== 0;

	const warnings = [
		aggregator === 'CowSwap' ? (
			<>
				{finalSelectedFromToken?.value === zeroAddress && Number(slippage) < 2 ? (
					<Alert status="warning" borderRadius="0.375rem" py="8px" key="cow1">
						<AlertIcon />
						Swaps from {finalSelectedFromToken.symbol} on CowSwap need to have slippage higher than 2%.
					</Alert>
				) : null}
				<Alert status="warning" borderRadius="0.375rem" py="8px" key="cow2">
					<AlertIcon />
					CowSwap orders are fill-or-kill, so they may not execute if price moves quickly against you.
					{finalSelectedFromToken?.value === zeroAddress ? (
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
		) : null
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
											onChange={(e) => setIsPrivacyEnabled(e.target.checked)}
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
							onSelectTokenChange={onFromTokenChange}
							balance={balance.data?.formatted}
							onMaxClick={onMaxClick}
							tokenPrice={fromTokenPrice}
						/>

						<SwapInputArrow
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
						/>

						<InputAmountAndTokenSelect
							placeholder={normalizedRoutes[0]?.amount}
							setAmount={setAmount}
							type="amountOut"
							amount={selectedRoute?.amount && amount !== '' ? selectedRoute.amount : amountOut}
							onSelectTokenChange={onToTokenChange}
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
						amountReturnedInSelectedRoute={selectedRoute && selectedRoute.price && selectedRoute.price.amountReturned}
						selectedRoutesPriceImpact={selectedRoutesPriceImpact}
						amount={selectedRoute?.amountIn}
						slippage={slippage}
						isPriceImpactNotKnown={isPriceImpactNotKnown}
					/>
					<Box display={['none', 'none', 'flex', 'flex']} flexDirection="column" gap="4px">
						{warnings}
					</Box>

					<SwapWrapper>
						<>
							{failedRoutes.length > 0 ? (
								<Alert status="warning" borderRadius="0.375rem" py="8px" mt="-14px" mb="16px">
									<AlertIcon />
									{`Routes for aggregators ${failedRoutes
										.map((r) => r.name)
										.join(', ')} have been hidden since they could not be executed`}
								</Alert>
							) : null}
						</>

						{!isConnected ? (
							<Button colorScheme={'messenger'} onClick={openConnectModal}>
								Connect Wallet
							</Button>
						) : !isValidSelectedChain ? (
							<Button
								colorScheme={'messenger'}
								onClick={() => {
									if (selectedChain) {
										switchChain({ chainId: selectedChain.id });
									} else {
										toast(
											formatUnknownErrorToast({
												title: 'Failed to switch network',
												message: 'Selected chain is invalid'
											})
										);
									}
								}}
							>
								Switch Network
							</Button>
						) : insufficientBalance ? (
							<Button colorScheme={'messenger'} aria-disabled>
								Insufficient Balance
							</Button>
						) : !selectedRoute && isSmallScreen && finalSelectedFromToken && finalSelectedToToken ? (
							<Button colorScheme={'messenger'} onClick={() => setUiState(STATES.ROUTES)}>
								Select Aggregator
							</Button>
						) : hasMaxPriceImpact && !isDegenModeEnabled ? (
							<Button colorScheme={'messenger'} aria-disabled>
								Price impact is too large
							</Button>
						) : (
							<>
								{router && address && (
									<>
										<>
											{isUSDTNotApprovedOnEthereum && finalSelectedFromToken && (
												<Flex flexDir="column" gap="4px" w="100%">
													<Text fontSize="0.75rem" fontWeight={400}>
														{`${
															finalSelectedFromToken?.symbol
														} uses an old token implementation that requires resetting approvals if there's a
														previous approval, and you currently have an approval for ${(
															Number(allowance) /
															10 ** finalSelectedFromToken.decimals
														).toFixed(2)} ${finalSelectedFromToken.symbol} for this contract, you
														need to reset your approval and approve again`}
													</Text>
													<Button
														isLoading={isApproveResetLoading}
														loadingText={isConfirmingResetApproval ? 'Confirming' : 'Preparing transaction'}
														colorScheme={'messenger'}
														onClick={() => {
															if (approveReset) approveReset();
														}}
														aria-disabled={isApproveResetLoading || !selectedRoute}
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
													isLoading={
														swapMutation.isPending ||
														isApproveLoading ||
														(gaslessApprovalMutation.isPending && !gaslessApprovalMutation.variables.isInfiniteApproval)
													}
													loadingText={
														isConfirmingApproval ||
														(gaslessApprovalMutation.isPending && !gaslessApprovalMutation.variables.isInfiniteApproval)
															? 'Confirming'
															: 'Preparing transaction'
													}
													colorScheme={'messenger'}
													onClick={() => {
														//scroll Routes into view
														!selectedRoute && routesRef.current?.scrollIntoView({ behavior: 'smooth' });

														if (!isApproved && isGaslessApproval) {
															handleGaslessApproval({ isInfiniteApproval: false });
															return;
														}

														if (!isEip5792 && approve) approve();

														if (
															balance.data &&
															!Number.isNaN(Number(balance.data.value)) &&
															selectedRoute?.fromAmount &&
															+selectedRoute.fromAmount > +balance?.data?.value?.toString()
														)
															return;

														if (isApproved) handleSwap();
													}}
													aria-disabled={
														isUSDTNotApprovedOnEthereum ||
														swapMutation.isPending ||
														gaslessApprovalMutation.isPending ||
														isApproveLoading ||
														isApproveResetLoading ||
														!(finalSelectedFromToken && finalSelectedToToken) ||
														insufficientBalance ||
														!selectedRoute ||
														slippageIsWorng ||
														!isAmountSynced ||
														isApproveInfiniteLoading
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
													loadingText={
														isConfirmingInfiniteApproval ||
														(gaslessApprovalMutation.isPending && gaslessApprovalMutation.variables.isInfiniteApproval)
															? 'Confirming'
															: 'Preparing transaction'
													}
													isLoading={
														isApproveInfiniteLoading ||
														(gaslessApprovalMutation.isPending && gaslessApprovalMutation.variables.isInfiniteApproval)
													}
													onClick={() => {
														if (!isApproved && isGaslessApproval) {
															handleGaslessApproval({ isInfiniteApproval: true });
															return;
														}

														if (approveInfinite) approveInfinite();
													}}
													aria-disabled={
														isUSDTNotApprovedOnEthereum ||
														swapMutation.isPending ||
														gaslessApprovalMutation.isPending ||
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

											{!isApproved && selectedRoute ? (
												<Tooltip2 content="Already approved? Click to refetch token allowance">
													<Button
														colorScheme={'messenger'}
														width={'24px'}
														padding={'4px'}
														onClick={() => refetchTokenAllowance?.()}
													>
														<RepeatIcon w="16px	" h="16px" />
													</Button>
												</Tooltip2>
											) : null}
										</>
									</>
								)}
							</>
						)}
					</SwapWrapper>
					{errorFetchingAllowance ? (
						<Text textAlign={'center'} color="red.500">
							{errorFetchingAllowance instanceof Error ? errorFetchingAllowance.message : 'Failed to fetch allowance'}
						</Text>
					) : null}
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
						<Flex as="h1" alignItems="center" justifyContent="space-between">
							<FormHeader as="span"> Select a route to perform a swap </FormHeader>

							<RefreshIcon refetch={refetch} lastFetched={lastFetched} />
						</Flex>
					) : !isLoading &&
					  amount &&
					  debouncedAmount &&
					  amount === debouncedAmount &&
					  finalSelectedFromToken &&
					  finalSelectedToToken &&
					  routes.length === 0 ? (
						<FormHeader>No available routes found</FormHeader>
					) : null}

					{normalizedRoutes?.length ? (
						<p style={{ fontSize: '12px', color: '#999999', marginLeft: '4px', marginTop: '4px', display: 'flex' }}>
							Best route is selected based on net output after gas fees.
						</p>
					) : null}

					{failedRoutes.length > 0 ? (
						<p style={{ fontSize: '12px', color: '#999999', marginLeft: '4px', marginTop: '4px', display: 'flex' }}>
							{`Routes for aggregators ${failedRoutes
								.map((r) => r.name)
								.join(', ')} have been hidden since they could not be executed`}
						</p>
					) : null}

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
								selectedChain!.label +
								finalSelectedFromToken!.label +
								finalSelectedToToken!.label +
								amountWithDecimals +
								gasPriceData?.gasPrice?.toString() +
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
								toToken={finalSelectedToToken!}
								amountFrom={r?.fromAmount}
								fromToken={finalSelectedFromToken!}
								selectedChain={selectedChain!.value}
								gasTokenPrice={gasTokenPrice}
								toTokenPrice={toTokenPrice}
								isFetchingGasPrice={fetchingTokenPrices}
								amountOut={amountOutWithDecimals}
								amountIn={r?.amountIn}
								isGasless={r?.isGasless}
							/>

							{aggregator === r.name && (
								<SwapUnderRoute>
									{!isConnected ? (
										<ConnectButtonWrapper>
											<ConnectButton />
										</ConnectButtonWrapper>
									) : !isValidSelectedChain ? (
										<Button
											colorScheme={'messenger'}
											onClick={() => {
												if (selectedChain) {
													switchChain({ chainId: selectedChain.id });
												} else {
													toast(
														formatUnknownErrorToast({
															title: 'Failed to switch network',
															message: 'Selected chain is invalid'
														})
													);
												}
											}}
										>
											Switch Network
										</Button>
									) : (
										<>
											{router && address && (
												<>
													<>
														{isUSDTNotApprovedOnEthereum && finalSelectedFromToken && (
															<Flex flexDir="column" gap="4px" w="100%">
																<Text fontSize="0.75rem" fontWeight={400}>
																	{`${
																		finalSelectedFromToken.symbol
																	} uses an old token implementation that requires resetting approvals if there's a
																		previous approval, and you currently have an approval for ${(
																			Number(allowance) /
																			10 ** finalSelectedFromToken.decimals
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
																	aria-disabled={isApproveResetLoading || !selectedRoute}
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
																isLoading={
																	swapMutation.isPending ||
																	isApproveLoading ||
																	(gaslessApprovalMutation.isPending &&
																		!gaslessApprovalMutation.variables.isInfiniteApproval)
																}
																loadingText={
																	isConfirmingApproval ||
																	(gaslessApprovalMutation.isPending &&
																		!gaslessApprovalMutation.variables.isInfiniteApproval)
																		? 'Confirming'
																		: 'Preparing transaction'
																}
																colorScheme={'messenger'}
																onClick={() => {
																	if (!isApproved && isGaslessApproval) {
																		handleGaslessApproval({ isInfiniteApproval: false });
																		return;
																	}

																	if (!isEip5792 && approve) approve();

																	if (
																		balance.data &&
																		!Number.isNaN(Number(balance.data.formatted)) &&
																		selectedRoute &&
																		+selectedRoute.amountIn > +balance.data.formatted
																	)
																		return;

																	if (isApproved) handleSwap();
																}}
																aria-disabled={
																	isUSDTNotApprovedOnEthereum ||
																	swapMutation.isPending ||
																	gaslessApprovalMutation.isPending ||
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
																loadingText={
																	isConfirmingInfiniteApproval ||
																	(gaslessApprovalMutation.isPending &&
																		gaslessApprovalMutation.variables.isInfiniteApproval)
																		? 'Confirming'
																		: 'Preparing transaction'
																}
																isLoading={
																	isApproveInfiniteLoading ||
																	(gaslessApprovalMutation.isPending &&
																		gaslessApprovalMutation.variables.isInfiniteApproval)
																}
																onClick={() => {
																	if (!isApproved && isGaslessApproval) {
																		handleGaslessApproval({ isInfiniteApproval: true });
																		return;
																	}

																	if (approveInfinite) approveInfinite();
																}}
																aria-disabled={
																	isUSDTNotApprovedOnEthereum ||
																	swapMutation.isPending ||
																	gaslessApprovalMutation.isPending ||
																	isApproveLoading ||
																	isApproveResetLoading ||
																	isApproveInfiniteLoading ||
																	!selectedRoute
																}
															>
																{'Approve Infinite'}
															</Button>
														)}

														{!isApproved && selectedRoute ? (
															<Tooltip2 content="Already approved? Click to refetch token allowance">
																<Button
																	colorScheme={'messenger'}
																	width={'24px'}
																	padding={'4px'}
																	onClick={() => refetchTokenAllowance?.()}
																>
																	<RepeatIcon w="16px	" h="16px" />
																</Button>
															</Tooltip2>
														) : null}
													</>
												</>
											)}
										</>
									)}

									{errorFetchingAllowance ? (
										<Text textAlign={'center'} color="red.500" width="100%">
											{errorFetchingAllowance instanceof Error
												? errorFetchingAllowance.message
												: 'Failed to fetch allowance'}
										</Text>
									) : null}
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
										gasPriceData?.gasPrice?.toString() +
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
			<TransactionModal open={txModalOpen} setOpen={setTxModalOpen} link={txUrl} />
		</Wrapper>
	);
}
