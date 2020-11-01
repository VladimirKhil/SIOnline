const path = require('path');
const webpack = require('webpack');
const CheckerPlugin = require('awesome-typescript-loader').CheckerPlugin;
const HtmlWebPackPlugin = require("html-webpack-plugin");

module.exports = (env) => {
	const isDevBuild = !(env && env.prod);
	return {
		mode: isDevBuild ? 'development' : 'production',
		entry: {			
			config: './assets/config.js',
			main: './src/Index.tsx'
		},
		devtool: isDevBuild ? 'inline-source-map' : undefined,
		devServer: {
			contentBase: './wwwroot',
			historyApiFallback: true
		},
		module: {
			rules: [
				{ test: /\.tsx?$/, use: 'awesome-typescript-loader?silent=true' },
				{ test: /\.css$/, use: isDevBuild ? ['style-loader', 'css-loader'] : ['style-loader', 'css-loader', 'postcss-loader'] },
				{ test: /\.(png|jpg|jpeg|gif)$/, use: 'url-loader?limit=25000' },
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
				{ test: /\.(eot|ttf|woff|otf)$/, use: 'url-loader?limit=25000' }
			]
		},
		resolve: {
			extensions: ['.tsx', '.ts', '.js']
		},
		output: {
			filename: (pathData) => {
				return pathData.chunk.name === 'config' || isDevBuild ? '[name].js': '[name].[contenthash].js';
			},
			chunkFilename: '[name].[contenthash].js',
			path: path.resolve(__dirname, 'dist'),
			publicPath: isDevBuild ? '' : '/si/online/'
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
			new CheckerPlugin(),
			new HtmlWebPackPlugin({
				template: "./src/index-template.html",
				filename: "./index.html"
			  })
		]
	}
};
