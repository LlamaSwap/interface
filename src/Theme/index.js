import * as React from 'react';
import { ThemeProvider as StyledComponentsThemeProvider, createGlobalStyle } from 'styled-components';
import { sm, med, lg, xl, twoXl } from '~/constants/breakpoints';

export default function ThemeProvider({ children }) {
	return <StyledComponentsThemeProvider theme={theme('dark')}>{children}</StyledComponentsThemeProvider>;
}

export const getStyle = (name, defaultValue) => {
	const queryParams = new URLSearchParams(window.location.search);

	return queryParams.get(name) || defaultValue;
};

const theme = (mode = 'dark') => {
	const colorMode = getStyle('mode', mode)
	const isDark = colorMode === 'dark'

	return {
		mode: isDark ? 'dark' : 'light',

		text1: '#FAFAFA',
		text2: '#C3C5CB',
		text3: '#6C7284',
		text4: '#565A69',
		text5: '#2C2F36',

		// special case text types
		white: '#FFFFFF',

		// backgrounds / greys
		bg1: '#212429',
		bg2: '#2C2F36',
		bg3: '#40444F',
		bg4: '#565A69',
		bg5: '#565A69',
		bg6: 'rgb(20 22 25)',
		bg7: 'rgba(7,14,15,0.7)',

		//specialty colors
		background: '#22242A',
		advancedBG: 'rgba(0,0,0,0.1)',
		divider: 'rgba(43, 43, 43, 0.435)',

		//primary colors
		primary1: '#2172E5',

		// other
		red1: '#FF6871',
		green1: '#27AE60',
		link: '#2172E5',
		blue: '#2f80ed',

		//shadow
		shadowSm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
		shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
		shadowMd: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
		shadowLg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',

		// breakpoints
		bpSm: `${sm}rem`,
		bpMed: `${med}rem`,
		bpLg: `${lg}rem`,
		bpXl: `${xl}rem`,
		bp2Xl: `${twoXl}rem`,

		maxSm: `@media screen and (max-width: ${sm}rem)`,
		maxMed: `@media screen and (max-width: ${med}rem)`,
		maxLg: `@media screen and (max-width: ${lg}rem)`,
		maxXl: `@media screen and (max-width: ${xl}rem)`,

		minSm: `@media screen and (min-width: ${sm}rem)`,
		minMed: `@media screen and (min-width: ${med}rem)`,
		minLg: `@media screen and (min-width: ${lg}rem)`,
		minXl: `@media screen and (min-width: ${xl}rem)`,
		min2Xl: `@media screen and (min-width: ${twoXl}rem)`,

		breakpoints: [`${sm}rem`, `${med}rem`, `${lg}rem`, `${xl}rem`]
	};
}

export const GlobalStyle = createGlobalStyle`
	body, #__next {
		background-color: ${({ theme }) => theme.background};
	}

  #__next {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-height: 100%;
    position: relative;
    color: ${({ theme }) => theme.text1};
    isolation: isolate;

    ${({ theme: { minLg } }) => minLg} {
      flex-direction: row;
    }
  }

	#__next,
	.chakra-modal__overlay,
	.chakra-modal__content-container {
		filter: ${({ theme }) => (theme.mode === 'light' ? 'invert(1) hue-rotate(180deg)' : undefined)};
	}

	#__next img,
	.chakra-modal__content-container img,
	button[data-testid=rk-connect-button] {
		filter: ${({ theme }) => (theme.mode === 'light' ? 'invert(1) hue-rotate(180deg)' : undefined)};
	}

  a, input, button, textarea, select {
    &:focus-visible {
      outline: 1px solid ${({ theme }) => theme.text1};
    }
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

	.tooltip-trigger {
		color: ${({ theme }) => theme.text1};
		display: flex;
		align-items: center;
		padding: 0;

		:focus-visible {
			outline-offset: 2px;
		}
	}

	.tooltip-trigger a {
		display: flex;
	}
`;
