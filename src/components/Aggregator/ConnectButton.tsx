import { Button } from '@chakra-ui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import styled from 'styled-components';
import { HistoryModal } from '../HistoryModal';

const Wrapper = styled.div`
	position: absolute;
	right: 16px;
	z-index: 100;
	display: flex;
	gap: 8px;
`;

const Connect = ({ tokenList = null }) => {
	return (
		<Wrapper>
			{tokenList ? <ConnectButton chainStatus={'none'} /> : null}
			<HistoryModal tokenList={tokenList} />
		</Wrapper>
	);
};

export default Connect;
