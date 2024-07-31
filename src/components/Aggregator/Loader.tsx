import styled from 'styled-components';
import loaderImg from '~/public/loader.png';

const LoaderWrapper = styled.div`
	margin: 0 auto;
	margin-top: 72px;
`;

const LoaderText = styled.div`
	margin-top: 8px;
	font-size: 20px;
	font-weight: 500;
	text-align: center;
	padding-left: 8px;
`;

const LoaderBody = styled.img`
	width: 120px;
	height: 120px;
	-webkit-animation: spin 3s linear infinite;
	-moz-animation: spin 3s linear infinite;
	animation: spin 3s linear infinite;
	@-moz-keyframes spin {
		100% {
			-moz-transform: rotate(360deg);
		}
	}
	@-webkit-keyframes spin {
		100% {
			-webkit-transform: rotate(360deg);
		}
	}
	@keyframes spin {
		100% {
			-webkit-transform: rotate(360deg);
			transform: rotate(360deg);
		}
	}
`;

const Loader = (props) => {
	return (
		<LoaderWrapper {...props}>
			<LoaderBody src={loaderImg.src} style={props?.spinnerStyles || {}} />
			<LoaderText>Loading...</LoaderText>
		</LoaderWrapper>
	);
};

export default Loader;
