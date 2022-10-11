const path = require('path');
const HtmlWebPackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = (env, argv) => {
	return {
		entry: {
			config: './assets/config.js',
			main: './src/Index.tsx'
		},
		devtool: argv.mode === 'development' ? 'inline-source-map' : undefined,
		devServer: {
			static: './wwwroot',
			historyApiFallback: true
		},
		module: {
			rules: [
				{ test: /\.tsx?$/, use: 'ts-loader' },
				{ test: /\.css$/, use: argv.mode === 'development' ? ['style-loader', 'css-loader'] : ['style-loader', 'css-loader', 'postcss-loader'] },
				{ test: /\.(png|jpg|jpeg|gif)$/i, type: 'asset/resource' },
				{
					test: /\.svg$/,
					use: ['@svgr/webpack', 'url-loader']
				},
				{
					test: /\.html$/,
					use: [
					  {
						loader: "html-loader",
						options: { minimize: true }
					  }
					]
				},
				{ test: /\.(eot|ttf|woff|otf)$/, type: 'asset/resource' }
			]
		},
		resolve: {
			extensions: ['.tsx', '.ts', '.js']
		},
		output: {
			filename: (pathData) => {
				return pathData.chunk.name === 'config' || argv.mode === 'development' ? '[name].js': '[name].[contenthash].js';
			},
			chunkFilename: '[name].[contenthash].js',
			path: path.resolve(__dirname, 'dist'),
			publicPath: '',
			crossOriginLoading: 'anonymous'
		},
		optimization: {
			splitChunks: {
				chunks: 'all',
				cacheGroups: {
					commons: {
						test: /[\\/]node_modules[\\/]/,
						name: 'vendor',
						chunks: 'all'
					}
				}
			}
		},
		plugins: [
			new CleanWebpackPlugin(),
			new HtmlWebPackPlugin({
				template: "./src/index-template.html",
				filename: "./index.html",
				favicon: './assets/images/favicon.ico'
			})
		]
	}
};
