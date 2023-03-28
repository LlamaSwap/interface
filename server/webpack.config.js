const slsw = require('serverless-webpack-fixed');
const path = require('path');

module.exports = {
	entry: slsw.lib.entries,
	target: 'node',
	mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: 'ts-loader',
				include: [path.resolve(__dirname, 'src'), path.resolve(__dirname, '../src/components/Aggregator')],
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
	externals: ['sharp', 'ethers'],
	resolve: {
		extensions: ['.ts', '.js', '.json'],
		alias: {
			'bignumber.js$': 'bignumber.js/bignumber.js',
			'node-fetch$': 'node-fetch/lib/index.js'
		}
	}
};
