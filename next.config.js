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
	async headers() {
		return [
			{
				// matching all API routes
				source: '/api/:path*',
				headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }]
			}
		];
	},
	experimental: {}
};

module.exports = withBundleAnalyzer(nextConfig);
