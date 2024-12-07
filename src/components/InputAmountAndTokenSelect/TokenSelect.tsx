import { useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Modal, ModalOverlay, ModalContent, ModalCloseButton, useDisclosure, Input } from '@chakra-ui/react';
import { WarningTwoIcon } from '@chakra-ui/icons';
import { Header, IconImage, PairRow } from '../Aggregator/Search';
import { Button, Flex, Text, Tooltip } from '@chakra-ui/react';
import { useDebounce } from '~/hooks/useDebounce';
import { useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import coingecko from '~/public/coingecko.svg';
import { allChains } from '../WalletProvider/chains';
import { ChevronDown } from 'react-feather';
import { useToken } from '../Aggregator/hooks/useToken';
import { isAddress } from 'viem';
import { IToken } from '~/types';

const Row = ({ chain, token, onClick }) => {
	const blockExplorer = allChains.find((c) => c.id == chain.id)?.blockExplorers?.default;
	const isMultichain = token.isMultichain;
	return (
		<PairRow
			key={token.value}
			data-defaultcursor={token.isGeckoToken ? true : false}
			onClick={() => !token.isGeckoToken && onClick(token)}
		>
			<IconImage src={token.logoURI} onError={(e) => (e.currentTarget.src = token.logoURI2 || '/placeholder.png')} />

			<Text display="flex" flexDir="column" whiteSpace="nowrap" textOverflow="ellipsis" overflow="hidden">
				<Tooltip
					label="This token could have been affected by the multichain hack."
					bg="black"
					color="white"
					isDisabled={!isMultichain}
				>
					<Text
						as="span"
						whiteSpace="nowrap"
						textOverflow="ellipsis"
						overflow="hidden"
						color={isMultichain ? 'orange.200' : 'white'}
					>
						{`${token.name} (${token.symbol})`}
						{token.isMultichain ? <WarningTwoIcon color={'orange.200'} style={{ marginLeft: '0.4em' }} /> : null}
					</Text>
				</Tooltip>

				{token.isGeckoToken && (
					<>
						<Text
							as="span"
							display="flex"
							alignItems="center"
							textColor="gray.400"
							justifyContent="flex-start"
							gap="4px"
							fontSize="0.75rem"
						>
							<span>via CoinGecko</span>
							<Image src={coingecko} height="14px" width="14px" objectFit="contain" alt="" unoptimized />
						</Text>
						{blockExplorer && (
							<a
								href={`${blockExplorer.url}/address/${token.address}`}
								target="_blank"
								rel="noreferrer noopener"
								style={{ fontSize: '0.75rem', textDecoration: 'underline' }}
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
				>
					<Button
						fontSize={'0.875rem'}
						fontWeight={500}
						ml="auto"
						colorScheme={'orange'}
						onClick={() => onClick(token)}
						leftIcon={<WarningTwoIcon />}
						flexShrink={0}
					>
						<span style={{ position: 'relative', top: '1px' }}>Import Token</span>
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

const SelectModal = ({ isOpen, onClose, data, onClick, selectedChain }) => {
	const [input, setInput] = useState('');
	const onInputChange = (e) => {
		setInput(e?.target?.value);
	};

	const debouncedInput = useDebounce(input, 300);

	const filteredData = useMemo(() => {
		return debouncedInput
			? data?.filter((token) => {
					if (token.symbol && token.symbol.toLowerCase()?.includes(debouncedInput.toLowerCase())) {
						return true;
					}

					if (token.address && token.address.toLowerCase() === debouncedInput.toLowerCase()) {
						return true;
					}

					if (token.name && token.name.toLowerCase()?.includes(debouncedInput.toLowerCase())) {
						return true;
					}

					return false;
				})
			: data;
	}, [debouncedInput, data]);

	const parentRef = useRef<HTMLDivElement>(null);

	const rowVirtualizer = useVirtualizer({
		count: filteredData.length,
		getScrollElement: () => parentRef?.current ?? null,
		estimateSize: (index) => (filteredData[index].isGeckoToken ? 72 : 40),
		overscan: 10
	});

	return (
		<Modal isCentered isOpen={isOpen} onClose={onClose}>
			<ModalOverlay />
			<ModalContent
				display="flex"
				flexDir="column"
				maxW="540px"
				maxH="500px"
				w="100%"
				h="100%"
				p="16px"
				borderRadius="16px"
				bg="#212429"
				color="white"
			>
				<Header>
					<Text fontWeight={500} color={'#FAFAFA'} fontSize={20}>
						Select Token
					</Text>
					<ModalCloseButton bg="none" pos="absolute" top="-4px" right="-8px" onClick={onClose} />
				</Header>
				<div>
					<Input
						bg="#141619"
						placeholder="Search... (Symbol or Address)"
						_focusVisible={{ outline: 'none' }}
						onChange={onInputChange}
						autoFocus
					/>
				</div>
				{isAddress(input) && filteredData.length === 0 ? (
					<AddToken address={input} onClick={onClick} selectedChain={selectedChain} />
				) : null}

				<div
					ref={parentRef}
					className="List"
					style={{
						height: `390px`,
						overflow: 'auto',
						marginTop: '24px'
					}}
				>
					<div
						style={{
							height: `${rowVirtualizer.getTotalSize()}px`,
							width: '100%',
							position: 'relative'
						}}
					>
						{rowVirtualizer.getVirtualItems().map((virtualRow) => (
							<div
								key={virtualRow.index + filteredData[virtualRow.index].address}
								style={{
									position: 'absolute',
									top: 0,
									left: 0,
									width: '100%',
									height: filteredData[virtualRow.index].isGeckoToken ? '72px' : '40px',
									transform: `translateY(${virtualRow.start}px)`
								}}
							>
								<Row token={filteredData[virtualRow.index]} onClick={onClick} chain={selectedChain} />
							</div>
						))}
					</div>
				</div>
			</ModalContent>
		</Modal>
	);
};

export const TokenSelect = ({
	tokens,
	onClick,
	token,
	selectedChain
}: {
	tokens: Array<IToken>;
	token?: IToken | null;
	onClick: (token: IToken) => void;
	selectedChain?: {
		id: any;
		value: string;
		label: string;
		chainId: number;
		logoURI?: string | null;
	} | null;
}) => {
	const { isOpen, onOpen, onClose } = useDisclosure();

	const onTokenClick = (token) => {
		onClick(token);
		onClose();
	};

	return (
		<>
			<Button
				display="flex"
				gap="6px"
				flexWrap="nowrap"
				alignItems="center"
				w="100%"
				borderRadius="8px"
				bg="#222429"
				_hover={{ bg: '#2d3037' }}
				maxW={{ base: '128px', md: '9rem' }}
				p="12px"
				onClick={() => onOpen()}
			>
				{token ? (
					<IconImage
						src={token.logoURI}
						onError={(e) => (e.currentTarget.src = token.logoURI2 || '/placeholder.png')}
					/>
				) : null}

				<Tooltip
					label="This token could have been affected by the multichain hack."
					bg="black"
					color="white"
					isDisabled={!token?.isMultichain}
				>
					{token?.isMultichain ? <WarningTwoIcon color={'orange.200'} /> : <></>}
				</Tooltip>

				<Text as="span" color="white" overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis" fontWeight={400}>
					{token ? token.symbol : 'Select Token'}
				</Text>

				<ChevronDown size={16} style={{ marginLeft: 'auto' }} />
			</Button>
			{isOpen ? (
				<SelectModal
					isOpen={isOpen}
					onClose={onClose}
					data={tokens}
					onClick={onTokenClick}
					selectedChain={selectedChain}
				/>
			) : null}
		</>
	);
};
