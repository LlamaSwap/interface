import * as React from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';

const TabsContainer = styled.div`
	width: 100%;
	background-color: rgb(34, 36, 42);
	border-radius: 10px;
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 16px;
`;

const TabButtonsWrapper = styled.div`
	background-color: ${({ theme }) => theme.background};
	display: flex;
	justify-content: center;
	border-radius: 12px;
	padding: 4px;
	box-shadow: 10px 0px 50px 10px rgba(26, 26, 26, 0.6);
	position: relative;
	overflow: hidden;
`;

const TabList = styled.ul`
	display: flex;
	list-style: none;
	margin: 0;
	padding: 0;
	position: relative;
	z-index: 1000;
	gap: 8px;
`;

const ActiveTabBackground = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	height: 100%;
	background-color: ${({ theme }) => theme.primary1};
	border-radius: 12px;
	transition:
		transform 0.3s ease,
		width 0.3s ease;
	will-change: transform, width;
`;

const Tab = styled.li<{ active: boolean }>`
	border-radius: 12px;
	padding: 0.625rem 1.25rem;
	cursor: pointer;
	color: ${({ active, theme }) => (active ? theme.white : theme.text1)};
	transition: color 0.3s ease, background-color 0.3s ease;
	font-size: 16px;
	font-weight: bold;
	display: flex;
	align-items: center;
	z-index: 1;
	background-color: ${({ active, theme }) => (active ? theme.primary1 : 'transparent')};
	position: relative;
	overflow: hidden;

	&:hover {
		background-color: rgba(33, 114, 229, 0.1);
		color: ${({ theme }) => theme.white};
	}

	&:hover::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color:
		border-radius: 25px;
	}
`;
const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
	width: 100%;
	align-self: flex-start;
	text-align: left;
	background-color: #22242a;
	margin-top: -24px;

	@media screen and (max-width: ${({ theme }) => theme.bpMed}) {
		margin-top: 48px;
	}
`;

const TabPanels = styled.div`
	width: 100%;
	background-color: rgb(34, 36, 42);
	border-radius: 10px;
	padding: 1rem;
	margin-top: 0.5rem;
	display: flex;
	justify-content: center;
	@media screen and (max-width: ${({ theme }) => theme.bpMed}) {
		padding: 0.5rem;
		margin-top: 0.25rem;
	}
`;

const Tabs = ({
	tabs
}: {
	tabs: Array<{
		id: string;
		name: string;
		content: JSX.Element;
	}>;
}) => {
	const router = useRouter();
	const [isRouterReady, setIsRouterReady] = React.useState(false);
	const [activeTab, setActiveTab] = React.useState('');
	const tabRefs = React.useRef<Array<React.RefObject<HTMLLIElement>>>([]);
	tabRefs.current = tabs.map((_, i) => tabRefs.current[i] ?? React.createRef());

	React.useEffect(() => {
		if (router.isReady) {
			const activeTabId = router.query.tab || 'swap';
			setActiveTab(activeTabId as string);
			setIsRouterReady(true);
		}
	}, [router.isReady, router.query.tab]);
	const handleTabChange = (index) => {
		const tabId = tabs[index].id;
		setActiveTab(tabId);
		router.push({ query: { tab: tabId } }, undefined, { shallow: true });
	};

	const getActiveTabStyles = () => {
		const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);
		const activeTabRef = tabRefs.current[activeIndex];
		const width = activeTabRef.current ? activeTabRef.current.offsetWidth : 0;
		const left = activeTabRef.current ? activeTabRef.current.offsetLeft : 0;

		return {
			width: `${width}px`,
			transform: `translateX(${left}px)`
		};
	};

	if (!isRouterReady) {
		return null;
	}

	return (
		<Wrapper>
			<TabsContainer>
				<TabButtonsWrapper>
					<TabList>
						{tabs.map((tab, index) => (
							<Tab
								ref={tabRefs.current[index]}
								key={tab.id}
								active={tab.id === activeTab}
								onClick={() => handleTabChange(index)}
							>
								{tab.name}
							</Tab>
						))}
						<ActiveTabBackground style={getActiveTabStyles()} />
					</TabList>
				</TabButtonsWrapper>
				<TabPanels>{tabs.find((tab) => tab.id === activeTab)?.content}</TabPanels>
			</TabsContainer>
		</Wrapper>
	);
};

export default Tabs;
