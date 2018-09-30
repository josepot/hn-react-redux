const path = require('path');
const fs = require('fs');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpackCleanupPlugin = require('webpack-cleanup-plugin');

const nodeModules = {};
fs
  .readdirSync('node_modules')
  .filter(x => ['.bin'].indexOf(x) === -1)
  .forEach(mod => {
    nodeModules[mod] = `commonjs ${mod}`;
  });

module.exports = {
  entry: {
    server: './src/server/index.js',
  },
  target: 'node',
  output: {
    path: path.join(__dirname, '..', 'dist', 'server'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.svg$/,
        use: ['svg-inline-loader'],
      }
    ],
  },
  externals: nodeModules,
  plugins: [
    new WebpackCleanupPlugin({
      exclude: ['webpack.json', '.gitignore'],
    }),
    new CopyWebpackPlugin([
      {from: 'public', to: 'public'},
      //      {from: 'src/server/data.json', to: ''},
    ]),
  ],
};
