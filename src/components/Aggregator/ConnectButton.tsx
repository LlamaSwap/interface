import { Points } from '@openspace-protocol/sdk';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import styled from 'styled-components';
import { HistoryModal } from '../HistoryModal';
const Wrapper = styled.div`
	position: absolute;
	right: 0px;
	z-index: 100;
	display: flex;
	gap: 8px;
`;

const Connect = ({ tokenList = null, tokensUrlMap = {}, tokensSymbolsMap = {} }) => {
	return (
		<Wrapper>
			<Points color="secondary" />
			{tokenList ? <HistoryModal tokensUrlMap={tokensUrlMap} tokensSymbolsMap={tokensSymbolsMap} /> : null}
			<ConnectButton chainStatus={'none'} />
		</Wrapper>
	);
};

export default Connect;
