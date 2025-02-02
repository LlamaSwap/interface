const slsw = require('serverless-webpack-fixed');
const path = require('path');

module.exports = {
	entry: slsw.lib.entries,
	target: 'node18',
	mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: 'ts-loader',
				include: [
					path.resolve(__dirname, 'src'),
					path.resolve(__dirname, '../src/components/Aggregator'),
					path.resolve(__dirname, '../src/components/WalletProvider')
				],
				exclude: /node_modules/
			},
			{
				test: /\.js$/,
				include: __dirname,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader'
				}
			},
			{
				test: /\.mjs$/,
				resolve: { mainFields: ['default'] }
			},
			{
				test: /\.(png|svg|jpg|jpeg|gif)$/i,
				type: 'asset/resource'
			}
		]
	},
	externals: {
		'node:crypto': 'commonjs crypto',
	},
	resolve: {
		extensions: ['.ts', '.js', '.json'],
		alias: {
			'bignumber.js$': 'bignumber.js/bignumber.js',
			'node-fetch$': 'node-fetch/lib/index.js'
		}
	}
};
