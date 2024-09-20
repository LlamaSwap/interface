import { useEffect, useRef } from 'react';
import styled from 'styled-components';

const Panel = ({ isVisible, children, setVisible }) => {
	const panelRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				isVisible &&
				panelRef.current &&
				!panelRef.current.contains(event.target) &&
				event.target !== buttonRef.current
			) {
				setVisible(false);
			}
		};

		document.addEventListener('click', handleClickOutside, true);

		return () => {
			document.removeEventListener('click', handleClickOutside, true);
		};
	}, [setVisible, isVisible]);

	return (
		<>
			<PanelBody isVisible={isVisible} ref={panelRef}>
				<div style={{ display: isVisible ? 'block' : 'none' }}>
					<PanelContent isVisible={isVisible}>{children}</PanelContent>
				</div>
			</PanelBody>
			<BlurWrapper isVisible={isVisible} />
		</>
	);
};

const BlurWrapper = styled.div<{ isVisible: boolean }>`
	display: ${({ isVisible }) => (isVisible ? 'block' : 'none')};
	opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: 3;
	backdrop-filter: blur(2px);
	transition: opacity 0.3s ease-in;
`;

const PanelBody = styled.div<{ isVisible: boolean }>`
	position: absolute;
	top: 0;
	right: 8px;
	border-radius: 16px;
	max-width: ${({ isVisible }) => (isVisible ? '400px' : '0')};
	height: 100%;
	background-color: ${(props) => props.theme.bg2};
	padding: ${({ isVisible }) => (isVisible ? '0px 8px 0px 16px' : '0')};
	z-index: 4;
	transition: width 0.3s ease;
	background-color: rgb(34, 36, 42);
	box-shadow: ${({ isVisible }) => (isVisible ? '-8px 0 8px rgba(0, 0, 0, 0.15)' : 'none')};

	overflow-y: auto;
	::-webkit-scrollbar {
		display: none;
	}
	-ms-overflow-style: none;
	scrollbar-width: none;
`;

const PanelContent = styled.div<{ isVisible: boolean }>`
	opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
	visibility: ${({ isVisible }) => (isVisible ? 'visible' : 'hidden')};
	transition:
		opacity 0.3s ease-in,
		visibility 0.5s ease-in;
`;

export const PanelButton = styled.button<{ isVisible: boolean }>`
	position: absolute;
	top: 50%;
	right: ${({ isVisible }) => (isVisible ? '288px' : '-20px')};
	font-size: 1rem;
	transform: translateY(-50%) rotate(270deg);
	background-color: rgb(34, 36, 42);
	color: ${(props) => props.theme.text1};
	border: none;
	border-radius: 12px 12px 0px 0;
	padding: 2px 12px 2px 12px;
	cursor: pointer;
	border-top: 1px solid #2f333c;
	border-left: 1px solid #2f333c;
	border-right: 1px solid #2f333c;
	z-index: 100;

	transition:
		background-color 0.3s ease,
		right 0.3s ease;

	&:hover {
		background-color: ${(props) => props.theme.bg3};
	}
`;

export default Panel;
