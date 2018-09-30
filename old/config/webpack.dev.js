const path = require('path');
const webpack = require('webpack');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const {browserProperties} = require('./browser-specific.js');

const devSvrPort = process.env.DEV_SVR_PORT || 9999;

const plugins = [
  new webpack.optimize.CommonsChunkPlugin({
    name: 'vendor',
    minChunks: module =>
      module.context && module.context.indexOf('node_modules') !== -1,
    filename: '[name].js',
  }),
  new webpack.DefinePlugin(
    Object.assign(
      {
        'process.env': {
          NODE_ENV: JSON.stringify(process.env.NODE_ENV),
          API_BASE_URL: JSON.stringify(process.env.API_BASE_URL),
        },
      },
      browserProperties.chrome
    )
  ),
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NamedModulesPlugin(),
  new HtmlWebPackPlugin({
    template: path.join(__dirname, '../public/index.dev.ejs'),
  }),
];

module.exports = {
  devtool: 'cheap-module-eval-source-map',
  devServer: {
    historyApiFallback: true,
    hot: true,
    contentBase: path.join(__dirname, '../public'),
    publicPath: '/',
    host: '0.0.0.0',
    port: devSvrPort,
    proxy: {'/api': 'http://127.0.0.1:1917'},
    compress: false,
    inline: true,
    stats: {
      assets: true,
      children: false,
      chunks: false,
      hash: false,
      modules: false,
      timings: true,
      version: false,
      warnings: true,
      colors: {green: '\u001b[32m'},
    },
  },
  entry: {
    index: [
      'react-hot-loader/patch',
      `webpack-dev-server/client?http://127.0.0.1:${devSvrPort}`,
      'webpack/hot/only-dev-server',
      path.join(__dirname, '../src/client/entries/client/'),
    ],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.svg$/,
        use: ['svg-inline-loader'],
      }
    ],
  },
  output: {
    filename: 'index.js',
    publicPath: `http://127.0.0.1:${devSvrPort}/`,
    devtoolModuleFilenameTemplate: 'webpack:///[absolute-resource-path]',
  },
  plugins,
  stats: {colors: {green: '\u001b[32m'}},
};
