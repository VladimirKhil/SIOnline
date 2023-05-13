const path = require('path');
const HtmlWebPackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
var WebpackPwaManifest = require('webpack-pwa-manifest');
const WorkboxPlugin = require('workbox-webpack-plugin');

module.exports = (env, argv) => {
	return {
		entry: {
			config: './assets/config.js',
			main: './src/Index.tsx',
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
				{ test: /\.(eot|ttf|woff|otf)$/, type: 'asset/resource' },
				{ test: /\.mp3?$/, type: 'asset/resource' },
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
			}),
			new WebpackPwaManifest({
				id: "sionline",
				name: "SIOnline",
				short_name: "SIOnline",
				decription: "SIGame web application",
				start_url: ".",
				theme_color: "#FFFFFF",
				background_color: "#010450",
				display: "standalone",
				crossorigin: 'use-credentials', //can be null, use-credentials or anonymous
				icons: [
				{
					src: path.resolve('assets/images/sionline.png'),
					sizes: [96, 128, 192, 256, 512] // multiple sizes
				}
				]
			})].concat(
				argv.mode === 'development'
					? []
					: [new WorkboxPlugin.GenerateSW({
							// these options encourage the ServiceWorkers to get in there fast
							// and not allow any straggling "old" SWs to hang around
							clientsClaim: true,
							skipWaiting: true,
							maximumFileSizeToCacheInBytes: 6291456
					})])
	}
};
