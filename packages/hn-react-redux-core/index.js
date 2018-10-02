const dataFns = require('./data');
const utils = require('./utils');
const config = require('./config');

module.exports = {
  ...config,
  ...utils,
  dataFns,
};
