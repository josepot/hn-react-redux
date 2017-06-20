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

if (ALLOW_OFFLINE) {
  const OfflinePluginRuntime = require('offline-plugin/runtime');
  OfflinePluginRuntime.install({
    onUpdateReady: () => OfflinePluginRuntime.applyUpdate(),
    onUpdate: () => {
      window.swUpdate = true;
    },
  });
}

require('./render.js');
