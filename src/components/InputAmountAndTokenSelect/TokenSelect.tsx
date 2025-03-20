import * as Ariakit from 'ariakit/dialog';
import { useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { WarningTwoIcon } from '@chakra-ui/icons';
import { IconImage, PairRow } from '../Aggregator/Search';
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

const Row = ({ chain, token, onClick, style }) => {
	const blockExplorer = allChains.find((c) => c.id == chain.id)?.blockExplorers?.default;
	return (
		<PairRow
			key={token.value}
			data-defaultcursor={token.isGeckoToken ? true : false}
			onClick={() => !token.isGeckoToken && onClick(token)}
			style={style}
		>
			<IconImage src={token.logoURI} onError={(e) => (e.currentTarget.src = token.logoURI2 || '/placeholder.png')} />

			<Text display="flex" flexDir="column" whiteSpace="nowrap" textOverflow="ellipsis" overflow="hidden">
				{token.isMultichain ? (
					<Tooltip
						label="This token could have been affected by the multichain hack."
						bg="black"
						color="white"
						fontSize="0.75rem"
						padding="8px"
					>
						<Text as="span" whiteSpace="nowrap" textOverflow="ellipsis" overflow="hidden" color="orange.200">
							{`${token.name} (${token.symbol})`}
							{token.isMultichain ? <WarningTwoIcon color={'orange.200'} style={{ marginLeft: '0.4em' }} /> : null}
						</Text>
					</Tooltip>
				) : (
					<Text as="span" whiteSpace="nowrap" textOverflow="ellipsis" overflow="hidden" color="white">
						{`${token.name} (${token.symbol})`}
					</Text>
				)}
				
				{token.isGeckoToken && (
					<>
						{blockExplorer && (
							<a
								href={`${blockExplorer.url}/address/${token.address}`}
								target="_blank"
								rel="noreferrer noopener"
								style={{ fontSize: '10px', textDecoration: 'underline' }}
							>{`View on ${blockExplorer.name}`}</a>
						)}
					</>
				)}
			</Text>

			{token.balanceUSD ? (
				<div style={{ marginRight: 0, marginLeft: 'auto' }}>
					{(token.amount / 10 ** token.decimals).toFixed(3)}
					<span style={{ fontSize: 12 }}> (~${token.balanceUSD?.toFixed(3)})</span>
				</div>
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
						ml="auto"
						colorScheme={'orange'}
						onClick={() => onClick(token)}
						leftIcon={<WarningTwoIcon />}
						flexShrink={0}
						height="28px"
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
			address,
			...(data || {}),
			label: data?.symbol,
			value: address,
			chainId: selectedChain?.id,
			logoURI: `https://token-icons.llamao.fi/icons/tokens/${selectedChain?.id ?? 1}/${address}?h=20&w=20`
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
				src={`https://token-icons.llamao.fi/icons/tokens/${selectedChain?.id ?? 1}/${address}?h=20&w=20`}
				onError={(e) => (e.currentTarget.src = '/placeholder.png')}
			/>

			<Text whiteSpace="nowrap" textOverflow="ellipsis" overflow="hidden">
				{isLoading
					? 'Loading...'
					: data?.name
						? `${data.name} (${data.symbol})`
						: address.slice(0, 4) + '...' + address.slice(-4)}
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

const SelectModal = ({ dialogState, data, onClick, selectedChain, isLoading }) => {
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
		estimateSize: () => 44,
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
				) : (
					<>
						{isAddress(input) && filteredData.length === 0 ? (
							<AddToken address={input} onClick={onClick} selectedChain={selectedChain} />
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
										onClick={onClick}
										chain={selectedChain}
										key={virtualRow.index + filteredData[virtualRow.index].address}
										style={{
											position: 'absolute',
											top: 0,
											left: 0,
											width: '100%',
											height: '44px',
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
		selectedChain
	} = useSelectedChainAndTokens();

	// balances of all token's in wallet
	const { data: tokenBalances } = useTokenBalances(address, router.isReady ? selectedChain?.id : null);

	// saved tokens list
	const savedTokens = useGetSavedTokens(selectedChain?.id);

	const tokensInChain = useMemo(() => {
		return (
			[
				...Object.values(chainTokenList),
				...savedTokens.filter((token) => (chainTokenList[token.address.toLowerCase()] ? false : true))
			]
				.map((token) => {
					const tokenBalance = token?.address ? tokenBalances?.[token.address.toLowerCase()] : {};

					return {
						...token,
						amount: tokenBalance?.amount ?? 0,
						balanceUSD: tokenBalance?.balanceUSD ?? 0
					};
				})
				.sort((a, b) => b.balanceUSD - a.balanceUSD) ?? []
		);
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

	const onTokenClick = (token) => {
		onClick(token);
		dialogState.toggle();
	};

	return (
		<>
			<Trigger onClick={dialogState.toggle}>
				{isLoading ? (
					<Text as="span" color="white" overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis" fontWeight={400}>
						Loading...
					</Text>
				) : (
					<>
						{token ? (
							<IconImage
								src={token.logoURI}
								onError={(e) => (e.currentTarget.src = token.logoURI2 || '/placeholder.png')}
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
						>
							{token ? token.symbol : 'Select Token'}
						</Text>
					</>
				)}

				<ChevronDown size={16} style={{ marginLeft: 'auto' }} />
			</Trigger>
			{dialogState.open ? (
				<SelectModal
					dialogState={dialogState}
					data={tokens}
					onClick={onTokenClick}
					selectedChain={selectedChain}
					isLoading={isLoading}
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
	height: 390px;
	overflow: auto;
	margin-top: 24px;
`;

const DialogHeading = styled(Ariakit.DialogHeading)`
	color: #fafafa;
	font-size: 20px;
	font-weight: 500;
	text-align: center;
	margin-bottom: 8px;
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
	height: 40px;
	padding: 0 12px;
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
	max-width: 540px;
	max-height: 500px;
	width: 100%;
	height: 100%;
	padding: 16px;
	border-radius: 16px;
	background: #212429;
	color: white;
	isolation: isolate;
	box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
	--inset: 0.75rem;
`;
