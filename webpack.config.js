const slsw = require('serverless-webpack-fixed');
const path = require('path');

const pathToInclude = [
	'src/server',
	'src/components/Aggregator/constants.ts',
	'src/components/Aggregator/rpcs.ts',
	'src/components/Aggregator/adapters/',
	'src/components/Aggregator/utils'
];

module.exports = {
	entry: slsw.lib.entries,
	target: 'node',
	mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
	module: {
		rules: [
			...pathToInclude.map((p) => ({
				test: /\.ts$/,
				use: 'ts-loader',
				include: path.resolve(__dirname, p),
				exclude: /node_modules/
			})),
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
