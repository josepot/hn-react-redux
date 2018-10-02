const path = require('path');
const webpack = require('webpack');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');

const isDev = process.env.NODE_ENV === 'development';

const plugins = [
  new webpack.DefinePlugin(
    Object.assign({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        API_BASE_URL: JSON.stringify(process.env.API_BASE_URL),
      },
    })
  ),
  new webpack.NamedModulesPlugin(),
  new HtmlWebPackPlugin({
    template: path.join(__dirname, 'public/index.html'),
  }),
  ...(isDev
    ? [new webpack.HotModuleReplacementPlugin()]
    : [new BundleAnalyzerPlugin()]),
];

module.exports = {
  mode: isDev ? 'development' : 'production',
  optimization: {
    splitChunks: {
      cacheGroups: {
        default: false,
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all',
        },
      },
    },
  },
  devtool: isDev ? 'cheap-module-eval-source-map' : 'source-map',
  devServer: {
    historyApiFallback: true,
    hot: true,
    contentBase: path.join(__dirname, 'public'),
  },
  entry: {
    index: './src/entry/index.js',
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
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
  },
  plugins,
  stats: {colors: {green: '\u001b[32m'}},
};
