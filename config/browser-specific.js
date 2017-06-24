const BrotliPlugin = require('brotli-webpack-plugin');

const browserProperties = {
  chrome: {
    POLYFILL_OBJECT_ASSIGN: false,
    POLYFILL_OBJECT_VALUES: false,
    POLYFILL_PROMISES: false,
    POLYFILL_FETCH: false,
    POLYFILL_URL: false,
    POLYFILL_REGENERATOR: false,
  },
  edge: {
    POLYFILL_OBJECT_ASSIGN: false,
    POLYFILL_OBJECT_VALUES: false,
    POLYFILL_PROMISES: false,
    POLYFILL_FETCH: false,
    POLYFILL_URL: true,
    POLYFILL_REGENERATOR: false,
  },
  fallback: {
    POLYFILL_OBJECT_ASSIGN: true,
    POLYFILL_OBJECT_VALUES: true,
    POLYFILL_PROMISES: true,
    POLYFILL_FETCH: true,
    POLYFILL_URL: true,
    POLYFILL_REGENERATOR: true,
  },
  firefox: {
    POLYFILL_OBJECT_ASSIGN: false,
    POLYFILL_OBJECT_VALUES: false,
    POLYFILL_PROMISES: false,
    POLYFILL_FETCH: false,
    POLYFILL_URL: false,
    POLYFILL_REGENERATOR: false,
  },
  safari: {
    POLYFILL_OBJECT_ASSIGN: false,
    POLYFILL_OBJECT_VALUES: false,
    POLYFILL_PROMISES: false,
    POLYFILL_FETCH: true,
    POLYFILL_URL: false,
    POLYFILL_REGENERATOR: false,
  },
};

const brotPlugin = new BrotliPlugin({
  asset: '[path].br[query]',
  test: /\.(js)$/,
  mode: 0,
  quality: 11,
});

const browserSpecificPlugins = {
  chrome: [brotPlugin],
  firefox: [brotPlugin],
};

module.exports = {
  browserProperties,
  browserSpecificPlugins,
};
