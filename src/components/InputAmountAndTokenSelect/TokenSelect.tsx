import * as Ariakit from 'ariakit/dialog';
import { useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { WarningTwoIcon } from '@chakra-ui/icons';
import { Button, Flex, Text, Tooltip } from '@chakra-ui/react';
import { useDebounce } from '~/hooks/useDebounce';
import { useQueryClient } from '@tanstack/react-query';
import { allChains } from '../WalletProvider/chains';
import { ChevronDown, X } from 'react-feather';
import { useToken } from '../Aggregator/hooks/useToken';
import { isAddress } from 'viem';
import { IToken } from '~/types';
import { useSelectedChainAndTokens } from '~/hooks/useSelectedChainAndTokens';
import { useGetSavedTokens } from '~/queries/useGetSavedTokens';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/router';
import { useTokenBalances } from '~/queries/useTokenBalances';
import styled from 'styled-components';
import { formatAddress } from '~/utils/formatAddress';
import { topTokensByChain } from '../Aggregator/constants';

const Row = ({ chain, token, onClick, style }) => {
	const blockExplorer = allChains.find((c) => c.id == chain.id)?.blockExplorers?.default;
	return (
		<PairRow
			key={token.value}
			data-defaultcursor={token.isGeckoToken ? true : false}
			onClick={() => !token.isGeckoToken && onClick(token)}
			style={style}
		>
			<IconImage
				src={token.logoURI}
				onError={(e) => (e.currentTarget.src = token.logoURI2 || '/placeholder.png')}
				height={32}
				width={32}
			/>

			<Flex flexDir="column" whiteSpace="nowrap" textOverflow="ellipsis" overflow="hidden">
				{token.isMultichain ? (
					<Tooltip
						label="This token could have been affected by the multichain hack."
						bg="black"
						color="white"
						fontSize="0.75rem"
						padding="8px"
					>
						<Text
							whiteSpace="nowrap"
							textOverflow="ellipsis"
							overflow="hidden"
							color="orange.200"
							display="flex"
							alignItems="center"
							gap="4px"
							fontWeight={500}
						>
							{token.name}
							{token.isMultichain ? <WarningTwoIcon color={'orange.200'} /> : null}
						</Text>
					</Tooltip>
				) : (
					<Text whiteSpace="nowrap" textOverflow="ellipsis" overflow="hidden" color="white" fontWeight={500}>
						{token.name}
					</Text>
				)}

				<Flex alignItems="center" gap="8px">
					<Text whiteSpace="nowrap" textOverflow="ellipsis" overflow="hidden" color="#A2A2A2">
						{token.symbol}
					</Text>
					{blockExplorer && (
						<LinkToExplorer
							href={`${blockExplorer.url}/address/${token.address}`}
							target="_blank"
							rel="noreferrer noopener"
							onClick={(e) => {
								e.stopPropagation();
							}}
						>
							{formatAddress(token.address, 5)}
						</LinkToExplorer>
					)}
				</Flex>
			</Flex>

			{token.balanceUSD ? (
				<Flex flexDir="column" marginLeft="auto">
					<Text whiteSpace="nowrap" textOverflow="ellipsis" overflow="hidden" textAlign="right">
						${token.balanceUSD?.toFixed(3)}
					</Text>
					<Text whiteSpace="nowrap" textOverflow="ellipsis" overflow="hidden" color="#A2A2A2" textAlign="right">
						{(token.amount / 10 ** token.decimals).toFixed(3)}
					</Text>
				</Flex>
			) : null}

			{token.isGeckoToken && (
				<Tooltip
					label="This token doesn't appear on active token list(s). Make sure this is the token that you want to trade."
					bg="black"
					color="white"
					fontSize="0.75rem"
					padding="8px"
				>
					<Button
						fontSize={'0.75rem'}
						fontWeight={500}
						ml={token.balanceUSD ? '0px' : 'auto'}
						colorScheme={'orange'}
						onClick={() => {
							saveToken(token);
							onClick(token);
						}}
						leftIcon={<WarningTwoIcon />}
						flexShrink={0}
						height="32px"
					>
						Import Token
					</Button>
				</Tooltip>
			)}
		</PairRow>
	);
};

const saveToken = (token) => {
	const tokens = JSON.parse(localStorage.getItem('savedTokens') || '{}');

	const chainTokens = tokens[token.chainId] || [];

	const newTokens = { ...tokens, [token.chainId]: chainTokens.concat(token) };

	localStorage.setItem('savedTokens', JSON.stringify(newTokens));
};

const AddToken = ({ address, selectedChain, onClick }) => {
	const { data, isLoading, error } = useToken({
		address: address as `0x${string}`,
		chainId: selectedChain.id,
		enabled: typeof address === 'string' && address.length === 42 && selectedChain ? true : false
	});

	const queryClient = useQueryClient();

	const onTokenClick = () => {
		if (error) return;

		saveToken({
			address: address.toLowerCase(),
			...(data || {}),
			label: data?.symbol,
			value: address,
			chainId: selectedChain?.id,
			logoURI: `https://token-icons.llamao.fi/icons/tokens/${selectedChain?.id ?? 1}/${address}?h=48&w=48`
		});

		queryClient.invalidateQueries({ queryKey: ['savedTokens', selectedChain?.id] });

		onClick({ address, label: data?.symbol, value: address });
	};

	return (
		<Flex
			alignItems="center"
			mt="16px"
			p="8px"
			gap="8px"
			justifyContent="space-between"
			flexWrap="wrap"
			borderBottom="1px solid #373944"
			key={address}
		>
			<IconImage
				src={`https://token-icons.llamao.fi/icons/tokens/${selectedChain?.id ?? 1}/${address}?h=48&w=48`}
				onError={(e) => (e.currentTarget.src = '/placeholder.png')}
				height={32}
				width={32}
			/>

			<Text whiteSpace="nowrap" textOverflow="ellipsis" overflow="hidden">
				{isLoading ? 'Loading...' : data?.name ? `${data.name} (${data.symbol})` : formatAddress(address)}
			</Text>

			<Button height={38} marginLeft="auto" onClick={onTokenClick} disabled={error ? true : false}>
				Add token
			</Button>

			{error ? (
				<Text
					fontSize="0.75rem"
					color="red"
					w="100%"
					textAlign="center"
				>{`This address is not a contract on ${selectedChain.value}`}</Text>
			) : null}
		</Flex>
	);
};

const SelectModal = ({ dialogState, data, onTokenSelect, selectedChain, isLoading, topTokens }) => {
	const [input, setInput] = useState('');
	const onInputChange = (e) => {
		setInput(e?.target?.value);
	};

	const debouncedInput = useDebounce(input, 300);

	const filteredData = useMemo(() => {
		const search = debouncedInput.toLowerCase();

		if (search && isAddress(search)) {
			const tokenByaddress = data?.find((token) => token.address === search);
			return tokenByaddress ? [tokenByaddress] : [];
		}

		return debouncedInput
			? data.filter((token) =>
					`${token.symbol?.toLowerCase() ?? ''}:${token.name?.toLowerCase() ?? ''}`.includes(search)
				)
			: data;
	}, [debouncedInput, data]);

	const parentRef = useRef<HTMLDivElement>(null);

	const rowVirtualizer = useVirtualizer({
		count: filteredData.length,
		getScrollElement: () => parentRef?.current ?? null,
		estimateSize: () => 52,
		overscan: 10
	});

	return (
		<>
			<Dialog state={dialogState} backdropProps={{ className: 'dialog-backdrop' }}>
				<DialogHeading>Select Token</DialogHeading>
				<DialogDismiss>
					<X size={20} />
				</DialogDismiss>

				<InputSearch placeholder="Search... (Symbol or Address)" onChange={onInputChange} autoFocus />

				{isLoading ? (
					<Text textAlign={'center'} marginTop="25%">
						Loading...
					</Text>
				) : isAddress(input) && filteredData.length === 0 ? (
					<AddToken address={input} onClick={onTokenSelect} selectedChain={selectedChain} />
				) : (
					<>
						{topTokens.length > 0 ? (
							<>
								<TopTokenWrapper>
									{topTokens.map((token) => (
										<TopToken
											key={`top-token-${selectedChain.id}-${token.address}`}
											onClick={() => {
												onTokenSelect(token);
											}}
										>
											<IconImage
												src={token.logoURI}
												onError={(e) => (e.currentTarget.src = token.logoURI2 || '/placeholder.png')}
												height={24}
												width={24}
											/>
											<span>{token.symbol}</span>
										</TopToken>
									))}
								</TopTokenWrapper>
							</>
						) : null}
						<VirtualListWrapper ref={parentRef}>
							<div
								style={{
									height: `${rowVirtualizer.getTotalSize()}px`,
									width: '100%',
									position: 'relative'
								}}
							>
								{rowVirtualizer.getVirtualItems().map((virtualRow) => (
									<Row
										token={filteredData[virtualRow.index]}
										onClick={onTokenSelect}
										chain={selectedChain}
										key={virtualRow.index + filteredData[virtualRow.index].address}
										style={{
											position: 'absolute',
											top: 0,
											left: 0,
											width: '100%',
											height: '52px',
											transform: `translateY(${virtualRow.start}px)`
										}}
									/>
								))}
							</div>
						</VirtualListWrapper>
					</>
				)}
			</Dialog>
		</>
	);
};

export const TokenSelect = ({
	onClick,
	type
}: {
	onClick: (token: IToken) => void;
	type: 'amountIn' | 'amountOut';
}) => {
	const { address } = useAccount();

	const router = useRouter();

	const {
		fetchingFromToken,
		fetchingToToken,
		finalSelectedFromToken,
		finalSelectedToToken,
		chainTokenList,
		selectedChain,
		fetchingTokenList
	} = useSelectedChainAndTokens();

	// balances of all token's in wallet
	const { data: tokenBalances } = useTokenBalances(address, router.isReady ? selectedChain?.id : null);

	// saved tokens list
	const savedTokens = useGetSavedTokens(selectedChain?.id);

	const { tokensInChain, topTokens } = useMemo(() => {
		const uniqSavedTokens = new Set(savedTokens.map((t) => t.address));

		const tokensInChain =
			[
				...Object.values(chainTokenList),
				...savedTokens.filter((token) => (chainTokenList[token.address] ? false : true))
			]
				.map((token) => {
					return {
						...token,
						amount: tokenBalances?.[token.address]?.amount ?? 0,
						balanceUSD: tokenBalances?.[token.address]?.balanceUSD ?? 0,
						isGeckoToken: token.isGeckoToken ? (uniqSavedTokens.has(token.address) ? false : true) : false
					};
				})
				.sort((a, b) => b.balanceUSD - a.balanceUSD) ?? [];

		const topTokens =
			selectedChain && topTokensByChain[selectedChain.id]
				? topTokensByChain[selectedChain.id]
						.map((token) => chainTokenList[token.toLowerCase()] ?? null)
						.filter((token) => token !== null)
				: [];

		return { tokensInChain, topTokens };
	}, [chainTokenList, selectedChain?.id, tokenBalances, savedTokens]);

	const { tokens, token } = useMemo(() => {
		if (type === 'amountIn') {
			return {
				tokens: tokensInChain.filter(({ address }) => address !== finalSelectedToToken?.address),
				token: finalSelectedFromToken
			};
		}

		return {
			tokens: tokensInChain.filter(({ address }) => address !== finalSelectedFromToken?.address),
			token: finalSelectedToToken
		};
	}, [tokensInChain, finalSelectedFromToken, finalSelectedToToken]);

	const isLoading = type === 'amountIn' ? fetchingFromToken : fetchingToToken;

	const dialogState = Ariakit.useDialogState();

	const onTokenSelect = (token) => {
		onClick(token);
		dialogState.toggle();
	};

	return (
		<>
			<Trigger onClick={dialogState.toggle}>
				{isLoading ? (
					<Text
						as="span"
						color="white"
						overflow="hidden"
						whiteSpace="nowrap"
						textOverflow="ellipsis"
						fontWeight={400}
						marginRight="auto"
					>
						Loading...
					</Text>
				) : (
					<>
						{token ? (
							<IconImage
								src={token.logoURI}
								onError={(e) => (e.currentTarget.src = token.logoURI2 || '/placeholder.png')}
								height={20}
								width={20}
							/>
						) : null}

						{token?.isMultichain ? (
							<Tooltip
								label="This token could have been affected by the multichain hack."
								bg="black"
								color="white"
								fontSize="0.75rem"
								padding="8px"
							>
								<WarningTwoIcon color={'orange.200'} />
							</Tooltip>
						) : null}

						<Text
							as="span"
							color="white"
							overflow="hidden"
							whiteSpace="nowrap"
							textOverflow="ellipsis"
							fontWeight={400}
							marginRight="auto"
						>
							{token ? token.symbol : 'Select Token'}
						</Text>
					</>
				)}

				<ChevronDown size={16} />
			</Trigger>
			{dialogState.open ? (
				<SelectModal
					dialogState={dialogState}
					data={tokens}
					onTokenSelect={onTokenSelect}
					selectedChain={selectedChain}
					isLoading={fetchingTokenList || isLoading}
					topTokens={topTokens}
				/>
			) : null}
		</>
	);
};

const Trigger = styled.button`
	display: flex;
	gap: 6px;
	flex-wrap: nowrap;
	align-items: center;
	height: 40px;
	padding: 12px;
	width: 100%;
	border-radius: 8px;
	background: #222429;
	max-width: 128px;
	font-size: 16px;

	:hover {
		background: #2d3037;
	}

	@media (min-width: 768px) {
		max-width: 9rem;
	}
`;

const VirtualListWrapper = styled.div`
	overflow: auto;
	margin-top: 16px;
`;

const DialogHeading = styled(Ariakit.DialogHeading)`
	color: #fafafa;
	font-size: 20px;
	font-weight: 500;
	text-align: center;
	margin-bottom: 8px;
	margin: 16px;
`;

const DialogDismiss = styled(Ariakit.DialogDismiss)`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 24px;
	height: 24px;
	position: absolute;
	top: 20px;
	right: 12px;
`;

const InputSearch = styled.input`
	background: #141619;
	border-radius: 8px;
	height: 52px;
	flex-shrink: 0;
	padding: 0 12px;
	margin: 0 16px;
	&::placeholder {
		color: #808080;
	}
`;

const Dialog = styled(Ariakit.Dialog)`
	position: fixed;
	inset: var(--inset);
	z-index: 50;
	margin: auto;
	display: flex;
	flex-direction: column;
	max-width: min(95vw, 520px);
	max-height: min(90vh, 600px);
	width: 100%;
	height: 100%;
	border-radius: 16px;
	background: #212429;
	color: white;
	isolation: isolate;
	box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
	--inset: 0.75rem;
`;

const PairRow = styled.div<{ hover?: boolean }>`
	display: flex;
	gap: 8px;
	padding: 0 16px;
	align-items: center;
	border-bottom: 1px solid #373944;

	cursor: pointer;

	&[data-defaultcursor='true'] {
		cursor: default;
	}

	&:hover {
		background-color: rgba(246, 246, 246, 0.1);
	}
`;

const IconImage = styled.img`
	border-radius: 50%;
	aspect-ratio: 1;
	flex-shrink: 0;
	object-fit: contain;
`;

const LinkToExplorer = styled.a`
	font-size: 12px;
	color: #a2a2a2;
	text-decoration: underline;
`;

const TopTokenWrapper = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 4px;
	padding: 16px 0 0 16px;
	flex-shrink: 0;

	& > span {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
`;

const TopToken = styled.button`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 4px;
	font-weight: 500;
	font-size: 14px;
	padding: 4px;
	background: #2d3037;
	height: 64px;
	width: 64px;
	border-radius: 8px;

	&:hover {
		background-color: rgba(246, 246, 246, 0.1);
	}
`;
