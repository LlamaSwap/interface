import styled from 'styled-components';
import Tooltip from '~/components/Tooltip';
import { useTokenApprove } from '../Aggregator/hooks';
import { Flex, Text } from '@chakra-ui/react';
import { Gift, Unlock } from 'react-feather';
import { GasIcon } from '../Icons';

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

	return (
		<RouteWrapper onClick={setRoute} selected={selected} best={index === 0}>
			<RouteRow>
				<Text fontWeight={500} fontSize={16} color={'#FAFAFA'}>
					<Flex as="span" alignItems="center" gap="8px">
						<span>{netOut && Number.isFinite(Number(netOut)) ? `$${Number(netOut).toFixed(3)}` : null}</span>

						{index === 0 ? (
							<Text as="span" color="green.200" fontSize={12}>
								BEST
							</Text>
						) : Number.isFinite(lossPercent) ? (
							<Text as="span" color="red.200" fontSize={12}>
								(-{Math.abs(100 - lossPercent * 100).toFixed(2)}%)
							</Text>
						) : null}
					</Flex>
				</Text>
				<Flex ml="auto" alignItems="center">
					<Text fontWeight={500} fontSize={16} color={'#FAFAFA'}>
						{amount.toFixed(3)}{' '}
					</Text>
					<img
						src={toToken?.logoURI}
						alt=""
						style={{ marginLeft: 4 }}
						onError={(e) => (e.currentTarget.src = '/notFound.png')}
					/>
				</Flex>
			</RouteRow>

			<RouteRow>
				<Text display="flex" alignItems="center" gap="4px" color="gray.400" lineHeight={1}>
					{name === 'CowSwap' ? (
						<Tooltip content="Gas is taken from output amount">
							<Text as="span" color="gray.400">
								{`${amountUsd} - ${
									gasUsd === 'Unknown' || Number.isNaN(Number(gasUsd)) ? gasUsd : '$' + Number(gasUsd).toFixed(3)
								}`}
							</Text>
						</Tooltip>
					) : (
						<>{`${amountUsd} - ${
							gasUsd === 'Unknown' || Number.isNaN(Number(gasUsd)) ? gasUsd : '$' + Number(gasUsd).toFixed(3)
						}`}</>
					)}

					<GasIcon />
				</Text>

				{airdrop ? (
					<Tooltip content="This project has no token and might airdrop one in the future">
						<Gift size={14} color="#A0AEC0" />
					</Tooltip>
				) : null}
				{isApproved ? (
					<Tooltip content="Token is approved for this aggregator.">
						<Unlock size={14} color="#A0AEC0" />
					</Tooltip>
				) : null}

				<Text color={'gray.400'} ml="auto">
					via {name}
				</Text>
			</RouteRow>
		</RouteWrapper>
	);
};

const RouteWrapper = styled.div<{ selected: boolean; best: boolean }>`
	display: grid;
	grid-row-gap: 8px;
	margin-top: 16px;

	background-color: ${({ theme, selected }) =>
		theme.mode === 'dark' ? (selected ? ' #161616;' : '#2d3039;') : selected ? ' #bec1c7;' : ' #dde3f3;'};
	border: ${({ theme }) => (theme.mode === 'dark' ? '1px solid #373944;' : '1px solid #c6cae0;')};
	padding: 8px;
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

	&:hover {
		background-color: ${({ theme }) => (theme.mode === 'dark' ? '#161616;' : '#b7b7b7;;')};
	}
`;

const RouteRow = styled.div`
	display: flex;
	align-items: center;
	gap: 16px;

	img {
		width: 24px;
		height: 24px;
		aspect-ratio: 1;
		border-radius: 50%;
		margin-right: 0;
	}
`;

export default Route;
