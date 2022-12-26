import { ethers } from 'ethers';
import { useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import { QuestionIcon } from '@chakra-ui/icons';
import { TYPE } from '~/Theme';
import ReactSelect from '../MultiSelect';
import { Header, IconImage, IconWrapper, ModalWrapper, PairRow } from './Search';
import { Input } from './TokenInput';
import { useNetwork, useToken } from 'wagmi';
import { Button } from '@chakra-ui/react';
import { CloseBtn } from '../CloseBtn';

const Row = ({ data: { data, onClick }, index, style }) => {
	const token = data[index];

	return (
		<PairRow key={token.value} style={style} onClick={() => onClick(token)}>
			<IconWrapper>
				<IconImage src={token.logoURI} />
			</IconWrapper>
			<TYPE.heading>{token.label}</TYPE.heading>
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

const AddToken = ({ address, onClick }) => {
	const { data } = useToken({ address });
	const { chain } = useNetwork();

	const onTokenClick = () => {
		onClick({ address, ...(data || {}), label: data?.symbol, value: address });
	};

	const onAddClick = () => {
		saveToken({ address, ...(data || {}), label: data?.symbol, value: address, chainId: chain?.id });
	};
	return (
		<PairRow key={address} style={{ lineHeight: '38px' }} hover={false} onClick={onTokenClick}>
			<IconWrapper>
				<QuestionIcon height="20px" width="20px" marginTop={'10px'} />
			</IconWrapper>
			<TYPE.heading>{data?.symbol || 'Loading...'}</TYPE.heading>
			<Button height={38} marginLeft="auto" onClick={onAddClick}>
				Add token
			</Button>
		</PairRow>
	);
};

const SelectModal = ({ close, data, onClick }) => {
	const [input, setInput] = useState('');
	const onInputChange = (e) => {
		setInput(e?.target?.value);
	};
	const filteredData = input
		? data?.filter((token) => token.symbol.toLowerCase().includes(input) || token.address.toLowerCase() === input)
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
			{ethers.utils.isAddress(input) ? <AddToken address={input} onClick={onClick} /> : null}
			<List height={390} itemCount={filteredData.length} itemSize={38} itemData={{ data: filteredData, onClick }}>
				{Row}
			</List>
		</ModalWrapper>
	);
};

const TokenSelect = ({ tokens, onClick, token }) => {
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
			{isOpen ? <SelectModal close={() => setOpen(false)} data={tokens} onClick={onTokenClick} /> : null}
		</>
	);
};

export default TokenSelect;
