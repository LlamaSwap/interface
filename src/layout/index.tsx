import * as React from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import ThemeProvider, { GlobalStyle } from '~/Theme';
import { Phishing } from './Phishing';
import ConnectButton from '~/components/Aggregator/ConnectButton';
import Header from '~/components/Aggregator/Header';

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
				<meta name="fc:frame" content="{&quot;version&quot;:&quot;next&quot;,&quot;imageUrl&quot;:&quot;https://swap.defillama.com/farcaster-miniapp-cover.png&quot;,&quot;button&quot;:{&quot;title&quot;:&quot;Open&quot;,&quot;action&quot;:{&quot;type&quot;:&quot;launch_frame&quot;,&quot;name&quot;:&quot;LlamaSwap!&quot;,&quot;url&quot;:&quot;https://swap.defillama.com&quot;,&quot;splashImageUrl&quot;:&quot;https://swap.defillama.com/loader.png&quot;,&quot;splashBackgroundColor&quot;:&quot;#22242A&quot;}}}"/>

			</Head>
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
		</>
	);
}
