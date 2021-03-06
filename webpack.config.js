import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import HtmlWebPackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import HashOutput from 'webpack-plugin-hash-output';
import SriPlugin from 'webpack-subresource-integrity';
import postcssPresetEnv from 'postcss-preset-env';
import postcssCSSO from 'postcss-csso';
import {
	DefinePlugin,
	HotModuleReplacementPlugin,
} from 'webpack';
import {
	publicPath,
} from './src/config';

const isProduction = process.env.NODE_ENV === 'production';

const contentSecurityPolicy = isProduction ? [
	`default-src 'none'`,
	`font-src https://fonts.gstatic.com/`,
	`img-src 'self'`,
	`script-src 'self'`,
	`style-src 'self' https://fonts.googleapis.com`,
	`connect-src 'self'`,
	`form-action 'self'`,
	`base-uri 'none'`,
	`object-src 'none'`,
] : [
	`default-src 'none'`,
	`font-src https://fonts.gstatic.com/`,
	`img-src 'self'`,
	`script-src 'self' 'unsafe-eval'`,
	`style-src 'self' blob: https://fonts.googleapis.com`,
	`connect-src 'self' ws:`,
	`form-action 'self'`,
	`base-uri 'none'`,
	`object-src 'none'`,
];

export default {
	'mode': isProduction ? 'production' : 'development',
	'entry': {
		'main': isProduction ? './app/index.js' : [
			'webpack-hot-middleware/client',
			'./app/index.js',
		],
	},
	'output': {
		'filename': isProduction ? '[name].[chunkhash].js' : '[name].[hash].js',
		'path': path.resolve(__dirname, 'dist', publicPath),
		'publicPath': `/${publicPath}/`,
		'crossOriginLoading': 'anonymous',
	},
	'performance': {
		'hints': false,
	},
	'optimization': {
		'minimize': isProduction,
		'minimizer': [
			new TerserPlugin({
				'cache': false,
				'terserOptions': {
					'compress': false,
					'output': {
						'comments': false,
					},
				},
			}),
		],
		'runtimeChunk': {
			'name': 'manifest',
		},
		'splitChunks': {
			'chunks': 'initial',
			'cacheGroups': {
				'vendor': {
					'name': 'vendor',
					'test': /node_modules/,
				},
				'styles': {
					'name': 'styles',
					'test': /\.css$/,
					'chunks': 'all',
					'enforce': true,
				},
			},
		},
	},
	'stats': {
		'all': undefined,
		'modules': false,
	},
	'watchOptions': {
		'poll': true,
		'ignored': /node_modules/,
	},
	'devServer': {
		'compress': true,
		'publicPath': `/${publicPath}/`,
		'watchOptions': {
			'poll': true,
			'ignored': /node_modules/,
		},
	},
	'module': {
		'rules': [
			{
				'test': /\.js$/,
				'exclude': /node_modules/,
				'use': {
					'loader': 'babel-loader',
				},
			},
			{
				'test': /\.css$/,
				'use': [
					isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
					{
						'loader': 'css-loader',
						'options': {
							'sourceMap': !isProduction,
						},
					},
					{
						'loader': 'postcss-loader',
						'options': {
							'sourceMap': !isProduction,
							'plugins': () => {
								const plugins = [
									postcssPresetEnv(),
								];
								
								if (isProduction) {
									plugins.push(postcssCSSO({
										'comments': false,
									}));
								}
								
								return plugins;
							},
						},
					},
				],
			},
			{
				'test': /\.(png|jpg|gif|svg|ico)$/,
				'use': [
					{
						'loader': 'file-loader',
						'options': {
							'name': `[name].[hash].[ext]`,
							'publicPath': `/${publicPath}`,
						},
					},
				],
			},
		],
	},
	'plugins': [
		new HashOutput(),
		new DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
		}),
		new HtmlWebPackPlugin({
			'template': 'app/public/index.html',
			'filename': 'index.html',
			'csp': contentSecurityPolicy.join('; '),
		}),
		new MiniCssExtractPlugin({
			'filename': '[name].css',
			'chunkFilename': '[name].[contenthash].css',
		}),
		new SriPlugin({
			'hashFuncNames': ['sha256', 'sha384'],
			'enabled': isProduction,
		}),
	].concat(isProduction ? [] : [
		new HotModuleReplacementPlugin(),
	]),
};
