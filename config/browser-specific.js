const CopyWebpackPlugin = require('copy-webpack-plugin');
const BrotliPlugin = require('brotli-webpack-plugin');
const OfflinePlugin = require('offline-plugin');

const browserProperties = {
  chrome: {
    POLYFILL_OBJECT_ASSIGN: false,
    POLYFILL_OBJECT_VALUES: false,
    POLYFILL_PROMISES: false,
    POLYFILL_FETCH: false,
    POLYFILL_URL: false,
    POLYFILL_REGENERATOR: false,
    ALLOW_OFFLINE: true,
  },
  edge: {
    POLYFILL_OBJECT_ASSIGN: false,
    POLYFILL_OBJECT_VALUES: false,
    POLYFILL_PROMISES: false,
    POLYFILL_FETCH: false,
    POLYFILL_URL: true,
    POLYFILL_REGENERATOR: false,
    ALLOW_OFFLINE: false,
  },
  fallback: {
    POLYFILL_OBJECT_ASSIGN: true,
    POLYFILL_OBJECT_VALUES: true,
    POLYFILL_PROMISES: true,
    POLYFILL_FETCH: true,
    POLYFILL_URL: true,
    POLYFILL_REGENERATOR: true,
    ALLOW_OFFLINE: false,
  },
  firefox: {
    POLYFILL_OBJECT_ASSIGN: false,
    POLYFILL_OBJECT_VALUES: false,
    POLYFILL_PROMISES: false,
    POLYFILL_FETCH: false,
    POLYFILL_URL: false,
    POLYFILL_REGENERATOR: false,
    ALLOW_OFFLINE: false,
  },
  safari: {
    POLYFILL_OBJECT_ASSIGN: false,
    POLYFILL_OBJECT_VALUES: false,
    POLYFILL_PROMISES: false,
    POLYFILL_FETCH: true,
    POLYFILL_URL: false,
    POLYFILL_REGENERATOR: false,
    ALLOW_OFFLINE: false,
  },
};

const copyPlugin = new CopyWebpackPlugin([{from: 'public/manifest.json'}], {
  copyUnmodified: true,
});

const brotPlugin = new BrotliPlugin({
  asset: '[path].br[query]',
  test: /\.(js)$/,
  mode: 0,
  quality: 11,
});

const browserSpecificPlugins = {
  chrome: [
    copyPlugin,
    new OfflinePlugin({
      cacheMaps: [
        {
          match: () => new URL('/shell', location),
          requestTypes: ['navigate'],
        },
      ],
      caches: {
        main: [':rest:'],
        additional: [':externals:'],
        optional: [],
      },
      externals: ['/shell'],
      excludes: [
        '**/.*',
        '**/*.map',
        '**/*.js.br',
        '**/*.js.gzip',
        '**/*.css',
        '**/*.css.br',
        '**/*.css.gzip',
      ],
      updateStrategy: 'changed',
      autoUpdate: 1000 * 60 * 10,
      AppCache: false,
      ServiceWorker: {
        events: true,
        entry: './src/client/sw-handler.js',
        publicPath: '/sw.js',
      },
    }),
    brotPlugin,
  ],
  firefox: [copyPlugin, brotPlugin],
};

module.exports = {
  browserProperties,
  browserSpecificPlugins,
};
