const R = require('ramda');
const fs = require('fs');
const {BROWSERS} = require('../config.js');

const CLASSIFICATIONS = R.values(BROWSERS);

const resources = R.converge(R.zipObj, [
  R.identity,
  R.map(
    R.pipe(
      key => JSON.parse(fs.readFileSync(`dist/${key}/webpack.json`, 'utf8')),
      R.prop('assetsByChunkName')
    )
  ),
])(CLASSIFICATIONS);

module.exports = resources;
