import { ethers } from 'ethers';
import { useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import { QuestionIcon } from '@chakra-ui/icons';
import { TYPE } from '~/Theme';
import ReactSelect from '../MultiSelect';
import { Header, IconImage, IconWrapper, ModalWrapper, PairRow } from './Search';
import { Input } from './TokenInput';
import { useNetwork, useToken } from 'wagmi';
import { Button, Text } from '@chakra-ui/react';
import { CloseBtn } from '../CloseBtn';

const Row = ({ data: { data, onClick }, index, style }) => {
	const token = data[index];

	return (
		<PairRow key={token.value} style={style} onClick={() => onClick(token)}>
			<IconWrapper>
				<IconImage src={token.logoURI} />
			</IconWrapper>
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
	const { data, isLoading } = useToken({
		address: address as `0x${string}`,
		chainId: selectedChain.id,
		enabled: typeof address === 'string' && address.length === 42 && selectedChain ? true : false
	});
	const { chain } = useNetwork();

	const onTokenClick = () => {
		saveToken({ address, ...(data || {}), label: data?.symbol, value: address, chainId: chain?.id });
		onClick({ address, label: data?.symbol, value: address });
	};

	return (
		<PairRow key={address} style={{ lineHeight: '38px' }} hover={false} onClick={onTokenClick}>
			<IconWrapper>
				<QuestionIcon height="20px" width="20px" marginTop={'10px'} />
			</IconWrapper>
			<TYPE.heading>
				{isLoading
					? 'Loading...'
					: data?.name
					? `${data.name} (${data.symbol})`
					: address.slice(0, 4) + '...' + address.slice(-4)}
			</TYPE.heading>
			<Button height={38} marginLeft="auto" onClick={onTokenClick}>
				Add token
			</Button>
		</PairRow>
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
					token.symbol.toLowerCase().includes(input.toLowerCase()) ||
					token.address.toLowerCase() === input.toLowerCase()
		  )
		: data;
	return (
		<ModalWrapper>
			<Header>
				<TYPE.largeHeader fontSize={20}>Select Token</TYPE.largeHeader>
				<CloseBtn onClick={close} />
			</Header>
			<div>
				<Input placeholder="Search... (Symbol or Address)" onChange={onInputChange} autoFocus />
			</div>
			{ethers.utils.isAddress(input) ? (
				<AddToken address={input} onClick={onClick} selectedChain={selectedChain} />
			) : null}
			<List height={390} itemCount={filteredData.length} itemSize={38} itemData={{ data: filteredData, onClick }}>
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
