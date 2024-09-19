import { ConnectButton } from '@rainbow-me/rainbowkit';
import styled from 'styled-components';
import { HistoryModal } from '../HistoryModal';
import ReactSelect from '~/components/MultiSelect';

const Wrapper = styled.div`
	position: absolute;
	right: 15px;
	top: 70px;
	z-index: 100;
	display: flex;
	gap: 8px;

	@media screen and (max-width: ${({ theme }) => theme.bpLg}) {
		top: 60px;
	}

	@media screen and (max-width: ${({ theme }) => `${parseInt(theme.bpMed.replace('rem', '')) - 2.01}rem`}) {
		top: 14px;
	}
`;

const Connect = ({
	tokenList = null,
	tokensUrlMap = {},
	tokensSymbolsMap = {},
	chains,
	selectedChain,
	onChainChange
}) => {
	return (
		<Wrapper>
			<ReactSelect options={chains} value={selectedChain} onChange={onChainChange} />

			<ConnectButton chainStatus={'none'} showBalance={false} />
			{tokenList ? <HistoryModal tokensUrlMap={tokensUrlMap} tokensSymbolsMap={tokensSymbolsMap} /> : null}
		</Wrapper>
	);
};

export default Connect;
