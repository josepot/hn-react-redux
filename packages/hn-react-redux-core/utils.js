const {PAGE_SIZE} = require('./config');

const flipCoin = (odds = 0.5) => Math.random() >= odds;

const sliceListByPage = (list, pageBaseOne) => {
  const from = PAGE_SIZE * (pageBaseOne - 1);
  const to = from + PAGE_SIZE;
  return list.slice(from, to);
};

module.exports = {flipCoin, sliceListByPage};
