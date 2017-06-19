const path = require('path');
const webpack = require('webpack');
const BabiliPlugin = require('babili-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const WebpackCleanupPlugin = require('webpack-cleanup-plugin');
const {
  browserProperties,
  browserSpecificPlugins,
} = require('./browser-specific.js');

const BROWSER_NAME = process.env.BABEL_ENV.split('.')[1];
const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  devtool: isProd ? 'source-map' : 'cheap-module-eval-source-map',
  entry: {
    application: './src/client/entries/client/index.js',
  },
  output: {
    filename: '[name].[chunkhash].js',
    path: path.resolve(__dirname, '..', 'dist', BROWSER_NAME),
    publicPath: `/dist/${BROWSER_NAME}/`,
    chunkFilename: '[name].[chunkhash].js',
  },
  stats: {
    colors: {green: '\u001b[32m'},
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          },
        },
      },
      {
        test: /\.svg$/,
        use: ['svg-inline-loader'],
      }
    ],
  },
  plugins: [
    new WebpackCleanupPlugin({
      exclude: ['webpack.json', '.gitignore'],
      quiet: true,
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: module =>
        module.context && module.context.indexOf('node_modules') !== -1,
      filename: '[name].[chunkhash].js',
    }),
    new webpack.DefinePlugin(
      Object.assign(
        {'process.env': {NODE_ENV: JSON.stringify(process.env.NODE_ENV)}},
        browserProperties[BROWSER_NAME]
      )
    ),
    new webpack.NamedModulesPlugin(),
    new BabiliPlugin(),
    new CompressionPlugin({
      asset: '[path].gzip[query]',
      algorithm: 'zopfli',
      test: /\.(js)$/,
    }),
    ...(browserSpecificPlugins[BROWSER_NAME] || []),
  ],
};
