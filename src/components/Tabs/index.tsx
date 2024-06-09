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
	gap: 8px;

	@media screen and (max-width: ${({ theme }) => theme.bpMed}) {
		padding: 16px;
		gap: 4px;
	}
`;

const TabButtonsWrapper = styled.div`
	background-color: ${({ theme }) => theme.background};
	display: inline-flex;
	justify-content: center;
	border-radius: 25px;
	padding: 12.5px 7.5px;
	box-shadow: 10px 0px 50px 10px rgba(26, 26, 26, 0.6);
	transition: box-shadow 0.3s ease;
`;

const TabList = styled.ul`
	display: inline-flex;
	justify-content: center;
	list-style: none;
	margin: 0;
	padding: 0;
`;

const Tab = styled.li<{ active: boolean }>`
	border-radius: 25px;
	padding: 0.625rem 1.25rem;
	margin: 0 0.75rem;
	cursor: pointer;
	background-color: ${({ active, theme }) => (active ? theme.primary1 : theme.bg3)};
	color: ${({ active, theme }) => (active ? theme.white : theme.text1)};
	transition: background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
	font-size: 16px;
	font-weight: bold;
	display: flex;
	flex-direction: row;
	align-items: center;

	&:hover {
		background-color: ${({ theme }) => theme.primary1};
		color: ${({ theme }) => theme.white};
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
	}
`;

const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
	padding: 16px;
	padding-top: 36px;
	padding-bottom: 0;
	width: 100%;
	align-self: flex-start;
	z-index: 1;
	text-align: left;
	background-color: #22242a;
`;

const tabs = [
	{
		id: '/',
		name: 'Swap'
	},
	{
		id: 'yields',
		name: 'Yields'
	},
	{
		id: 'lend-borrow',
		name: 'Lend & Borrow'
	}
];

const Tabs = () => {
	const router = useRouter();
	const activeTabId = router.pathname.split('/')[1];

	const [activeTab, setActiveTab] = React.useState(activeTabId || tabs[0].id);

	const handleTabChange = (index) => {
		const tabId = tabs[index].id;
		setActiveTab(tabId);
		router.push(`/${tabId}`, undefined, { shallow: true });
	};

	return (
		<Wrapper>
			<TabsContainer>
				<TabButtonsWrapper>
					<TabList>
						{tabs.map((tab, index) => (
							<Tab key={tab.id} active={tab.id === activeTab} onClick={() => handleTabChange(index)}>
								{tab.name}
							</Tab>
						))}
					</TabList>
				</TabButtonsWrapper>
			</TabsContainer>
		</Wrapper>
	);
};

export default Tabs;
