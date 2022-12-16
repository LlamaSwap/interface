const withBundleAnalyzer = require('@next/bundle-analyzer')({
	enabled: process.env.ANALYZE === 'true'
});

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	images: {
		domains: ['icons.llama.fi', 'assets.coingecko.com']
	},
	compiler: {
		styledComponents: true
	},
	headers: [
		{
			key: 'Access-Control-Allow-Origin',
			value: '*'
		},
		{
			key: 'Access-Control-Allow-Methods',
			value: 'GET'
		},
		{
			key: 'Access-Control-Allow-Headers',
			value: 'X-Requested-With, content-type, Authorization'
		}
	],
	experimental: {}
};

module.exports = withBundleAnalyzer(nextConfig);
