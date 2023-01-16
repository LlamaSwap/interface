import { useState } from 'react';
import { Input } from './TokenInput';
import styled from 'styled-components';
import { CloseBtn } from '../CloseBtn';
import { Text } from '@chakra-ui/react';

interface Props {
	tokens: Array<{ symbol: string; address: string }>;
	setTokens: (
		obj: Record<'token0' | 'token1', { address: string; logoURI: string; symbol: string; decimals: string }>
	) => void;
}
export const ModalOverlay = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.6);
	z-index: 50;
	display: flex;
	justify-content: center;
	align-items: center;
`;

export const ModalWrapper = styled.div`
	display: flex;
	flex-direction: column;
	max-width: 540px;
	height: 500px;
	background: ${({ theme }) => theme.bg1};
	top: -50px;
	bottom: 0;
	left: 0;
	right: 0;
	margin: auto;
	width: 100%;
	margin: 0 20px;
	box-shadow: ${({ theme }) =>
		theme.mode === 'dark'
			? '10px 0px 50px 10px rgba(26, 26, 26, 0.9);'
			: '10px 0px 50px 10px rgba(211, 211, 211, 0.9);;'};
	padding: 16px;
	border-radius: 16px;
	z-index: 2;

	animation: scale-in-center 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;

	@keyframes scale-in-center {
		0% {
			transform: scale(0);
			opacity: 1;
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}
`;

export const Header = styled.div`
	position: sticky;
	text-align: center;
	justify-content: center;
	display: flex;
	margin-bottom: 8px;
`;

export const PairRow = styled.div<{ hover?: boolean }>`
	display: flex;
	gap: 8px;
	padding: 8px 4px;
	align-items: center;
	border-bottom: ${({ theme }) => (theme.mode === 'dark' ? '1px solid #373944;' : '2px solid #c6cae0;')};

	cursor: pointer;

	&[data-defaultcursor='true'] {
		cursor: default;
	}

	&:hover {
		background-color: ${({ hover }) => (hover ? ' rgba(246, 246, 246, 0.1);' : 'none')};
	}
`;

export const IconImage = styled.img`
	border-radius: 50%;
	width: 20px;
	height: 20px;
	aspect-ratio: 1;
	flex-shrink: 0;
`;
export const IconWrapper = styled.div`
	display: flex;
	margin-right: 8px;
`;

const Pairs = styled.div`
	overflow-y: scroll;
`;

const Row = ({ data, onClick }) => {
	return (
		<PairRow key={data.value} onClick={() => onClick(data)}>
			<IconWrapper>
				<IconImage src={data.token0.logoURI} onError={(e) => (e.currentTarget.src = '/placeholder.png')} /> -{' '}
				<IconImage src={data.token1.logoURI} onError={(e) => (e.currentTarget.src = '/placeholder.png')} />
			</IconWrapper>
			<Text whiteSpace="nowrap" textOverflow="ellipsis" overflow="hidden">
				{data.label}
			</Text>
		</PairRow>
	);
};

const Modal = ({ close, onInputChange, data, onClick }) => {
	return (
		<ModalOverlay>
			<ModalWrapper>
				<Header>
					<Text fontWeight={500} color={'#FAFAFA'} fontSize={20}>
						Search
					</Text>
					<CloseBtn onClick={close} />
				</Header>
				<div>
					<Input placeholder="Search... (BTC-ETH)" onChange={onInputChange} autoFocus />
				</div>

				<Pairs>
					{data.map((pair) => (
						<Row data={pair} onClick={onClick} key={pair.value} />
					))}
				</Pairs>
			</ModalWrapper>
		</ModalOverlay>
	);
};

export default function Search({ tokens, setTokens }: Props) {
	const [isOpen, setIsOpen] = useState(false);

	const toggle = () => setIsOpen((open) => !open);

	const [data, setData] = useState([]);

	const onRowClick = (pair) => {
		setTokens(pair);
		setIsOpen(false);
		setData([]);
	};

	const onChange = ({ target: { value } }) => {
		const [symbol0, symbol1] = value.split(/-| | \//);
		if (symbol0?.length < 2) {
			setData([]);
			return;
		}

		const tokens00 = tokens.filter(({ symbol }) => symbol.toLowerCase() === symbol0.toLowerCase());
		const tokens01 = tokens.filter(({ symbol }) => symbol.toLowerCase().includes(symbol0.toLowerCase()));
		const tokens0 = tokens00.concat(tokens01);

		const tokens1 = (() => {
			if (tokens0.length > 100 || !symbol1) return tokens.slice(0, 100);
			else return tokens.filter(({ symbol }) => symbol.toLowerCase().includes(symbol1));
		})();

		const data = tokens0.reduce(
			(acc, token0) =>
				acc.concat(
					tokens1.map((token1) => ({
						token1,
						token0,
						label: `${token0.symbol}-${token1.symbol}`,
						value: `${token0.address}-${token1.address}`
					}))
				),
			[]
		);

		setData(data);
	};

	return (
		<>
			<Input
				placeholder="Search... (BTC-ETH)"
				disabled
				onClick={() => {
					toggle();
				}}
			/>
			{isOpen ? (
				<Modal onClick={onRowClick} close={() => setIsOpen(false)} onInputChange={onChange} data={data} />
			) : null}
		</>
	);
}
