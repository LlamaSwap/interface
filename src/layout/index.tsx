import * as React from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import ThemeProvider, { GlobalStyle } from '~/Theme';
import { Phishing } from './Phishing';
import ConnectButton from '~/components/Aggregator/ConnectButton';
import Header from '~/components/Aggregator/Header';

const AppWrapper = styled.div`
	min-height: 100vh;
	display: flex;
	flex-direction: column;
`;

const PageWrapper = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
	margin: 16px;
	isolation: isolate;

	@media screen and (min-width: ${({ theme }) => theme.bpLg}) {
		margin: 28px;
	}
`;

const Center = styled.main`
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 28px;
	width: 100%;
	min-height: 100%;
	margin: 0 auto;
	color: ${({ theme }) => theme.text1};

	@media screen and (max-width: ${({ theme }) => theme.bpMed}) {
		gap: 0px;
	}
`;

interface ILayoutProps {
	title: string;
	children: React.ReactNode;
	defaultSEO?: boolean;
	backgroundColor?: string;
	style?: React.CSSProperties;
}

export default function Layout({ title, children, ...props }: ILayoutProps) {
	return (
		<>
			<Head>
				<title>{title}</title>
			</Head>
			<AppWrapper>
				<Phishing />
				<ThemeProvider>
					<GlobalStyle />
					<PageWrapper>
						<Center {...props}>
							<Header>
								<ConnectButton {...(props as any)} />
							</Header>
							{children}
						</Center>
					</PageWrapper>
				</ThemeProvider>
			</AppWrapper>
		</>
	);
}
