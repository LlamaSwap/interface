import { ethers } from 'ethers';
import { useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { QuestionIcon, WarningTwoIcon } from '@chakra-ui/icons';
import ReactSelect from '../MultiSelect';
import { Header, IconImage, ModalWrapper, PairRow, ModalOverlay } from './Search';
import { Input } from './TokenInput';
import { useToken } from 'wagmi';
import { Button, Flex, Text, Tooltip } from '@chakra-ui/react';
import { CloseBtn } from '../CloseBtn';
import { useDebounce } from '~/hooks/useDebounce';
import { useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import coingecko from '~/public/coingecko.svg';
import { allChains } from '../WalletProvider/chains';

const Row = ({ chain, token, onClick }) => {
	const blockExplorer = allChains.find((c) => c.id == chain.id)?.blockExplorers?.default;

	return (
		<PairRow
			key={token.value}
			data-defaultcursor={token.isGeckoToken ? true : false}
			onClick={() => !token.isGeckoToken && onClick(token)}
		>
			<IconImage
				src={token.logoURI || '/placeholder.png'}
				onError={(e) => (e.currentTarget.src = '/placeholder.png')}
			/>

			<Text display="flex" flexDir="column" whiteSpace="nowrap" textOverflow="ellipsis" overflow="hidden">
				<Text
					as="span"
					whiteSpace="nowrap"
					textOverflow="ellipsis"
					overflow="hidden"
				>{`${token.name} (${token.symbol})`}</Text>

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
							<Image src={coingecko} height="14px" width="14px" objectFit="contain" alt="" />
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
	const { data, isLoading, isError } = useToken({
		address: address as `0x${string}`,
		chainId: selectedChain.id,
		enabled: typeof address === 'string' && address.length === 42 && selectedChain ? true : false
	});

	const queryClient = useQueryClient();

	const onTokenClick = () => {
		if (isError) return;

		saveToken({
			address,
			...(data || {}),
			label: data?.symbol,
			value: address,
			chainId: selectedChain?.id
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
			<QuestionIcon height="20px" width="20px" />

			<Text whiteSpace="nowrap" textOverflow="ellipsis" overflow="hidden">
				{isLoading
					? 'Loading...'
					: data?.name
					? `${data.name} (${data.symbol})`
					: address.slice(0, 4) + '...' + address.slice(-4)}
			</Text>

			<Button height={38} marginLeft="auto" onClick={onTokenClick} disabled={isError}>
				Add token
			</Button>

			{isError && (
				<Text
					fontSize="0.75rem"
					color="red"
					w="100%"
					textAlign="center"
				>{`This address is not a contract on ${selectedChain.value}`}</Text>
			)}
		</Flex>
	);
};

const SelectModal = ({ close, data, onClick, selectedChain }) => {
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

	const parentRef = useRef();

	const rowVirtualizer = useVirtualizer({
		count: filteredData.length,
		getScrollElement: () => parentRef.current,
		estimateSize: (index) => (filteredData[index].isGeckoToken ? 72 : 40),
		overscan: 5
	});

	return (
		<ModalOverlay>
			<ModalWrapper>
				<Header>
					<Text fontWeight={500} color={'#FAFAFA'} fontSize={20}>
						Select Token
					</Text>
					<CloseBtn onClick={close} />
				</Header>
				<div>
					<Input placeholder="Search... (Symbol or Address)" onChange={onInputChange} autoFocus />
				</div>
				{ethers.utils.isAddress(input) && filteredData.length === 0 ? (
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
			</ModalWrapper>
		</ModalOverlay>
	);
};

const TokenSelect = ({ tokens, onClick, token, selectedChain }) => {
	const [isOpen, setOpen] = useState(false);

	const onTokenClick = (token) => {
		onClick(token);
		setOpen(false);
	};

	return (
		<>
			<span style={{ cursor: 'pointer' }} onClick={() => setOpen(true)}>
				<ReactSelect openMenuOnClick={false} value={token} isDisabled />
			</span>
			{isOpen ? (
				<SelectModal close={() => setOpen(false)} data={tokens} onClick={onTokenClick} selectedChain={selectedChain} />
			) : null}
		</>
	);
};

export default TokenSelect;
