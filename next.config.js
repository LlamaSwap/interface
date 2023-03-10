const withBundleAnalyzer = require('@next/bundle-analyzer')({
	enabled: process.env.ANALYZE === 'true'
});

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	images: {
		domains: ['icons.llama.fi', 'assets.coingecko.com', 'icons.llamao.fi']
	},
	compiler: {
		styledComponents: true
	},
	async headers() {
		return [
			{
				source: '/:path*',
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
				]
			}
		];
	},
	experimental: {}
};

module.exports = withBundleAnalyzer(nextConfig);
