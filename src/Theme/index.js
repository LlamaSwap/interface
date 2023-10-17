import * as React from 'react';
import { ThemeProvider as StyledComponentsThemeProvider, createGlobalStyle } from 'styled-components';
import { sm, med, lg, xl, twoXl } from '~/constants/breakpoints';

export default function ThemeProvider({ children }) {
	return <StyledComponentsThemeProvider theme={theme('dark')}>{children}</StyledComponentsThemeProvider>;
}

const getStyle = (name, defaultValue) => {
	const queryParams = new URLSearchParams(window.location.search);

	return queryParams.get(name) || defaultValue;
};

const theme = (darkMode) => ({
	mode: darkMode ? 'dark' : 'light',

	text1: darkMode ? getStyle('text1', '#FAFAFA') : '#1F1F1F',
	text2: darkMode ? getStyle('text2', '#C3C5CB') : '#565A69',
	text3: darkMode ? getStyle('text3', '#6C7284') : '#888D9B',
	text4: darkMode ? getStyle('text4', '#565A69') : '#C3C5CB',
	text5: darkMode ? getStyle('text5', '#2C2F36') : '#EDEEF2',

	// special case text types
	white: '#FFFFFF',

	// backgrounds / greys
	bg1: darkMode ? getStyle('bg1', '#212429') : '#FAFAFA',
	bg2: darkMode ? getStyle('bg2', '#2C2F36') : '#F7F8FA',
	bg3: darkMode ? getStyle('bg3', '#40444F') : '#EDEEF2',
	bg4: darkMode ? getStyle('bg4', '#565A69') : '#CED0D9',
	bg5: darkMode ? getStyle('bg5', '#565A69') : '#888D9B',
	bg6: darkMode ? getStyle('bg6', 'rgb(20 22 25)') : '#FFFFFF',
	bg7: darkMode ? getStyle('bg7', 'rgba(7,14,15,0.7)') : 'rgba(252,252,251,1)',

	//specialty colors
	background: darkMode ? getStyle('background', '#22242A') : '#ffffff',
	advancedBG: darkMode ? getStyle('advancedBG', 'rgba(0,0,0,0.1)') : 'rgba(255,255,255,0.4)',
	divider: darkMode ? getStyle('divider', 'rgba(43, 43, 43, 0.435)') : 'rgba(43, 43, 43, 0.035)',

	//primary colors
	primary1: darkMode ? getStyle('primary1', '#2172E5') : '#445ed0',

	// other
	red1: getStyle('red1', '#FF6871'),
	green1: getStyle('green1', '#27AE60'),
	link: getStyle('link', '#2172E5'),
	blue: getStyle('blue', '#2f80ed'),

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
});

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
