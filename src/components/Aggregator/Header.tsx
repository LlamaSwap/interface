import { Heading, Image } from '@chakra-ui/react';
import styled from 'styled-components';
import loaderImg from '~/public/loader.png';

const Wrapper = styled.div`
	position: absolute;
	z-index: 100;
	display: flex;
	justify-content: space-between;
	width: calc(100% - 32px);

	@media screen and (min-width: ${({ theme }) => theme.bpMed}) {
		position: relative;
		width: 100%;
	}
`;

const Name = styled(Heading)`
	font-size: 26px;

	@media screen and (min-width: ${({ theme }) => theme.bpLg}) {
		margin: 0 auto;
	}
`;

const Header = ({ children }) => {
	return (
		<Wrapper>
			<Name
				fontSize={['26px', '26px', '32px', '32px']}
				display="flex"
				alignItems="center"
				onClick={() => window.open('https://swap.defillama.com/')}
				cursor="pointer"
			>
				<Image
					src={loaderImg.src}
					w={['28px', '28px', '36px', '36px']}
					h={['28px', '28px', '36px', '36px']}
					mr="8px"
					alt="logo"
				/>
				LlamaSwap
			</Name>
			{children}
		</Wrapper>
	);
};

export default Header;
