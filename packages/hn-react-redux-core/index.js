const dataFns = require('./data');
const {PAGE_SIZE, ...config} = require('./config');

module.exports = {
  ...config,
  PAGE_SIZE,
  dataFns,
  sliceListByPage: (list, pageBaseOne) => {
    const from = PAGE_SIZE * (pageBaseOne - 1);
    const to = from + PAGE_SIZE;
    return list.slice(from, to);
  },
};
