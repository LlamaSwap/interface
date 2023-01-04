import { ethers } from 'ethers';
import { useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import { QuestionIcon } from '@chakra-ui/icons';
import ReactSelect from '../MultiSelect';
import { Header, IconImage, ModalWrapper, PairRow } from './Search';
import { Input } from './TokenInput';
import { useNetwork, useToken } from 'wagmi';
import { Button, Flex, Text } from '@chakra-ui/react';
import { CloseBtn } from '../CloseBtn';

const Row = ({ data: { data, onClick }, index, style }) => {
	const token = data[index];

	return (
		<PairRow key={token.value} style={style} onClick={() => onClick(token)}>
			<IconImage src={token.logoURI} onError={(e) => (e.currentTarget.src = '/placeholder.png')} />

			<Text whiteSpace="nowrap" textOverflow="ellipsis" overflow="hidden">{`${token.name} (${token.symbol})`}</Text>
			{token.balanceUSD ? (
				<div style={{ marginRight: 0, marginLeft: 'auto' }}>
					{(token.amount / 10 ** token.decimals).toFixed(3)}
					<span style={{ fontSize: 12 }}> (~${token.balanceUSD?.toFixed(3)})</span>
				</div>
			) : null}
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

	const { chain } = useNetwork();

	const onTokenClick = () => {
		if (isError) return;

		saveToken({ address, ...(data || {}), label: data?.symbol, value: address, chainId: chain?.id });
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
			onClick={onTokenClick}
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
	const filteredData = input
		? data?.filter(
				(token) =>
					token.symbol?.toLowerCase()?.includes(input.toLowerCase()) ??
					token.address?.toLowerCase() === input.toLowerCase()
		  )
		: data;
	return (
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
			{ethers.utils.isAddress(input) ? (
				<AddToken address={input} onClick={onClick} selectedChain={selectedChain} />
			) : null}
			<List height={390} itemCount={filteredData.length} itemSize={40} itemData={{ data: filteredData, onClick }}>
				{Row}
			</List>
		</ModalWrapper>
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
