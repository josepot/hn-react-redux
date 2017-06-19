const {PAGE_SIZE} = require('../../config.js');

module.exports = {
  sliceListByPage: (list, pageBaseOne) => {
    const from = PAGE_SIZE * (pageBaseOne - 1);
    const to = from + PAGE_SIZE;
    return list.slice(from, to);
  },
};
