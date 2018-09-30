/* eslint-disable global-require */
/* eslint-disable no-undef */
if (POLYFILL_OBJECT_ASSIGN) {
  require('object-assign-polyfill');
}
if (POLYFILL_OBJECT_VALUES) {
  require('object.values').shim();
}
if (POLYFILL_PROMISES) {
  window.Promise = require('promise-polyfill');
}
if (POLYFILL_REGENERATOR) {
  require('babel-regenerator-runtime');
}
if (POLYFILL_FETCH) {
  require('unfetch/polyfill');
}
if (POLYFILL_URL) {
  require('url-polyfill');
}

if (navigator.serviceWorker) {
  navigator.serviceWorker.register('/sw.js').then(reg => {
    setInterval(() => reg.update(), 1000 * 60 * 30);
  });
}

require('./render.js');
