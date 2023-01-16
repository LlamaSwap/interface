import styled from 'styled-components';
import Tooltip from '~/components/Tooltip';
import { useTokenApprove } from '../Aggregator/hooks';
import { Flex, Text } from '@chakra-ui/react';
import { Gift, Unlock } from 'react-feather';
import { GasIcon } from '../Icons';
import { formattedNum } from '~/utils';

interface IToken {
	address: string;
	logoURI: string;
	symbol: string;
	decimals: number;
}

interface IPrice {
	amountReturned: string;
	estimatedGas: string;
	tokenApprovalAddress: string;
	logo: string;
}

interface IRoute {
	name: string;
	price: IPrice;
	toToken: IToken;
	fromToken: IToken;
	selectedChain: string;
	setRoute: () => void;
	selected: boolean;
	index: number;
	gasUsd: number | string;
	amountUsd: string;
	airdrop: boolean;
	amountFrom: string;
	lossPercent: number;
	gasTokenPrice: number;
	txData: string;
	netOut: number;
}

const Route = ({
	name,
	price,
	toToken,
	setRoute,
	selected,
	index,
	gasUsd,
	amountUsd,
	airdrop,
	fromToken,
	amountFrom,
	lossPercent,
	netOut
}: IRoute) => {
	const { isApproved } = useTokenApprove(fromToken?.address, price?.tokenApprovalAddress as `0x${string}`, amountFrom);

	if (!price.amountReturned || (Number(gasUsd) === 0 && name !== 'CowSwap')) return null;

	const amount = +price.amountReturned / 10 ** +toToken?.decimals;
	
	let quotedRate = Number(+price.amountReturned / 10 ** +toToken?.decimals) / Number(+amountFrom / 10 ** +fromToken?.decimals)
		//eth/usdt
		console.log(quotedRate)
		quotedRate = quotedRate < 0.001 ? `${formattedNum(1/quotedRate)} ${fromToken.symbol} per ${toToken.symbol}`  : `${formattedNum(quotedRate)} ${toToken.symbol} per ${fromToken.symbol}`
		console.log(quotedRate)

	return (
		<RouteWrapper onClick={setRoute} className="RouteWrapper" className={selected?'is-selected':null} selected={selected} best={index === 0}>
			<RouteRow>
				<Flex alignItems="baseline">
					
					<Text fontWeight={500} fontSize={19} fontWeight={700} color={'#FAFAFA'}>
						{amount.toFixed(3)}{' '}
					</Text>
					{/* <img
						src={toToken?.logoURI}
						alt=""
						onError={(e) => (e.currentTarget.src = '/notFound.png')}
					/> */}
					<Text fontWeight={500} fontSize={19} fontWeight={600} marginLeft={'4px'} color={'#ccc'}>
						{toToken?.symbol}
					</Text>

					<Text fontSize={12} className="secondary-data" fontWeight={500} marginLeft={'4px'} color='gray.500'>
						<Text as='span' fontSize={14} fontWeight={500}>≈ {netOut && Number.isFinite(Number(netOut)) ? `$${formattedNum(netOut,false,true)}` : null}</Text> after fees
					</Text>

				</Flex>
				<Text fontWeight={500} fontSize={16} color={'#FAFAFA'}>
					<Flex as="span" alignItems="center" gap="8px">
						

						{index === 0 ? (
							<Text as="span" color="#059669" fontSize={14} fontWeight={700}>
								BEST
							</Text>
						) : Number.isFinite(lossPercent) ? (
							<Text as="span" color="red.600" fontSize={12}>
								-{Math.abs(100 - lossPercent * 100).toFixed(2)}%
							</Text>
						) : null}
					</Flex>
				</Text>
			</RouteRow>

			<RouteRow>
				
				

				<Text as="span"  color="gray.500" fontWeight={500}>
					{quotedRate}
				</Text>

				{airdrop ? (
					<Tooltip content="This project has no token and might airdrop one in the future">
						<Gift size={14} color="#A0AEC0" />
					</Tooltip>
				) : null}
				

				<Text display="flex" gap="6px" color={'gray.500'}  fontWeight={500} ml="auto">
					
					<Text display="flex" alignItems="center" gap="4px" color="gray.500">
						<GasIcon/>
						{name === 'CowSwap' ? (
							<Tooltip content="Gas is taken from output amount">
								<Text as="span" color='gray.500' fontWeight={500}>
									{`${
										gasUsd === 'Unknown' || Number.isNaN(Number(gasUsd)) ? gasUsd : '$' + Number(gasUsd).toFixed(3)
									}`}
								</Text>
							</Tooltip>
						) : (
							<Text as="span" fontWeight={500}>{`${
								gasUsd === 'Unknown' || Number.isNaN(Number(gasUsd)) ? gasUsd : '$' + Number(gasUsd).toFixed(3)
							}`}</Text>
						)}
						<Text display="flex" gap="3px">
							via 
							{isApproved ? (
								<Tooltip content="Token is approved for this aggregator.">
									<Unlock size={14} color="#059669" />
								</Tooltip>
							) : " "}
							{name}
						</Text> 	
					</Text>
										
				</Text>
			</RouteRow>
		</RouteWrapper>
	);
};

const RouteWrapper = styled.div<{ selected: boolean; best: boolean }>`
	display: grid;
	grid-row-gap: 4px;
	margin-top: 16px;
	&.is-selected {
		border-color: #059669;
	}

	background-color: ${({ theme, selected }) =>
		theme.mode === 'dark' ? (selected ? ' #161616;' : '#2d3039;') : selected ? ' #bec1c7;' : ' #dde3f3;'};
	border: ${({ theme }) => (theme.mode === 'dark' ? '1px solid #373944;' : '1px solid #c6cae0;')};
	padding: 7px 15px 9px;
	border-radius: 8px;
	cursor: pointer;

	animation: swing-in-left-fwd 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
	@keyframes swing-in-left-fwd {
		0% {
			transform: rotateX(100deg);
			transform-origin: left;
			opacity: 0;
		}
		100% {
			transform: rotateX(0);
			transform-origin: left;
			opacity: 1;
		}
	}
	.secondary-data {
		opacity: 0;
		transition: opacity 0.2s linear;
	}
	&:hover {
		background-color: ${({ theme }) => (theme.mode === 'dark' ? '#161616;' : '#b7b7b7;;')};
	}
	&:hover , &.is-selected, &:first-of-type {
		.secondary-data {
			opacity: 1;
		}
	}
`;

const RouteRow = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16px;

	img {
		width: 15px;
		height: 15px;
		aspect-ratio: 1;
		border-radius: 50%;
		margin: 0 0px 0 6px;
	}
`;

export default Route;

