const path = require('path');
const HtmlWebPackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');

module.exports = (env, argv) => {
	return {
		entry: env.type === 'library-table' ? {
			main: './src/LibraryTable.tsx',
		} : env.type === 'library-quest' ? {
			main: './src/LibraryQuestion.tsx',
		} : {
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
				{
					test: /\.scss$/,
					use: [
						'style-loader',
						{
							loader: 'css-loader',
							options: { sourceMap: argv.mode === 'development' },
						},
						{
							loader: 'sass-loader',
							options: { sourceMap: argv.mode === 'development' },
						}
					]
				},
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
				// TODO: I cannot make it work, so all referenced images from manifest would be automatically copied to dist folder
				// {
				// 	test: require.resolve('./assets/manifest/manifest.json'),
				// 	use: [
				// 		{
				// 			loader: 'val-loader',
				// 			options: {
				// 				executableFile: path.resolve(
				// 					__dirname,
				// 					"assets",
				// 					"manifest",
				// 					"manifest-loader.js"
				// 				)
				// 			}
				// 		}
				// 	]
				// }
			]
		},
		resolve: {
			extensions: ['.tsx', '.ts', '.js']
		},
		output: {
			filename: (pathData) => {
				return pathData.chunk.name === 'config' || argv.mode === 'development' || env.type && env.type.startsWith('library') ? '[name].js': '[name].[contenthash].js';
			},
			chunkFilename: '[name].[contenthash].js',
			path: path.resolve(__dirname, 'dist'),
			publicPath: '',
			crossOriginLoading: 'anonymous',
			library: env.type && env.type.startsWith('library') ? 'sigame' : undefined,
			libraryTarget: env.type && env.type.startsWith('library') ? 'var' : undefined
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
			})].concat(
				argv.mode === 'production' && (!env.type || !env.type.startsWith('library'))
					?  [new WorkboxPlugin.GenerateSW({
							// these options encourage the ServiceWorkers to get in there fast
							// and not allow any straggling "old" SWs to hang around
							clientsClaim: true,
							skipWaiting: true,
							maximumFileSizeToCacheInBytes: 6291456
					})]
					: []
			)
	}
};
