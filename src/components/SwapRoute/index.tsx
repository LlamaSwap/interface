import styled from 'styled-components';
import Tooltip from '~/components/Tooltip';
import { useTokenApprove } from '../Aggregator/hooks';
import { Text } from '@chakra-ui/react';
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
					<div style={{ display: 'flex' }}>
						{netOut && Number.isFinite(Number(netOut))
							? `$${Number(netOut).toLocaleString(undefined, {
									minimumFractionDigits: 3,
									maximumFractionDigits: 3
							  })}`
							: null}

						{index === 0 ? (
							<Text color="green.200" ml={2} fontSize={12} lineHeight={'26px'}>
								BEST
							</Text>
						) : Number.isFinite(lossPercent) ? (
							<Text color="red.200" ml={2} fontSize={12} lineHeight={'26px'}>
								(-{Math.abs(100 - lossPercent * 100).toFixed(2)}%)
							</Text>
						) : null}
					</div>
				</Text>
				<div style={{ marginLeft: 'auto', display: 'flex' }}>
					<Text fontWeight={500} fontSize={16} color={'#FAFAFA'}>
						{amount.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}{' '}
					</Text>
					<img src={toToken?.logoURI} alt="" style={{ marginLeft: 4 }} />
				</div>
			</RouteRow>

			<RouteRow>
				<Text style={{ display: 'flex' }} color="gray.400" lineHeight={1}>
					{name === 'CowSwap' ? (
						<Tooltip content="Gas is taken from output amount">
							<Text style={{ display: 'flex', marginTop: '-6px' }} color="gray.400">
								${amountUsd} -{' '}
								<div>${gasUsd.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</div>
							</Text>
						</Tooltip>
					) : (
						<>
							${amountUsd} -{' '}
							<div>
								{gasUsd === 'Unknown' ? (
									gasUsd
								) : (
									<>${gasUsd.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</>
								)}
							</div>
						</>
					)}

					<span style={{ marginLeft: '4px' }}>
						<GasIcon />
					</span>
				</Text>

				<span style={{ marginLeft: '8px', display: 'flex' }}>
					{airdrop ? (
						<Tooltip content="This project has no token and might airdrop one in the future">
							<span style={{ marginLeft: 4 }}>
								{' '}
								<Gift width={14} height={14} color="#A0AEC0" style={{ marginTop: '-6px' }} />
							</span>
						</Tooltip>
					) : null}
					{isApproved ? (
						<Tooltip content="Token is approved for this aggregator.">
							<span style={{ marginLeft: 4 }}>
								<Unlock width={14} height={14} color="#A0AEC0" style={{ marginTop: '-6px' }} />
							</span>
						</Tooltip>
					) : null}
				</span>

				<div style={{ marginLeft: 'auto', display: 'flex' }}>
					<Text color={'gray.400'}>via {name}</Text>
				</div>
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

	img {
		width: 24px;
		height: 24px;
		aspect-ratio: 1;
		border-radius: 50%;
		margin-right: 0;
	}
`;

export default Route;
