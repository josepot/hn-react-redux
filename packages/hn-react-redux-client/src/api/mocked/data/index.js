import {zipObj} from 'ramda';
import {flipCoin, dataFns, sliceListByPage} from 'hn-react-redux-core';
import data from './data.json';

const {getDescendants} = dataFns(data);

const shuffleList = listId => {
  const list = data.lists[listId];
  const len = list.length;

  for (let i = 0; i < len - 1; i += 1) {
    // eslint-disable-next-line no-continue
    if (flipCoin(0.333)) continue;

    const lowId = list[i + 1];
    const highId = list[i];
    list[i + 1] = highId;
    list[i] = lowId;
    data.items[lowId].score = data.itesm[highId].score + 1;
  }
  return list;
};

const getRandomDescendants = rootId => {
  const root = data.items[rootId];
  const odds = 1 / (root.descendants + 1);
  const flipCoinFn = flipCoin.bind(null, odds);

  const innerGetRndmDescendants = id => {
    const item = data.items[id];
    return !item
      ? {}
      : (item.kids || [])
          .filter(flipCoinFn)
          .map(innerGetRndmDescendants)
          .reduce((res, obj) => Object.assign(res, obj), {[id]: item});
  };

  return innerGetRndmDescendants(rootId);
};

export const getList = (listId, page) => {
  const list = data.lists[listId];
  const pageItemIds = sliceListByPage(list, page);
  const pageItems = pageItemIds.map(itemId => data.items[itemId]);

  return {
    list,
    items: zipObj(pageItemIds, pageItems),
    timestamp: Date.now(),
  };
};

export const getShuffledList = (listId, page) => {
  shuffleList(listId);
  return getList(listId, page);
};

export const getDiscussion = rootId => ({
  items: getDescendants(rootId),
  timestamp: Date.now(),
});

export const getRndmDiscussion = rootId => ({
  items: getRandomDescendants(rootId),
  timestamp: Date.now(),
});

export const getUser = id => ({
  user: data.users[id],
  timestamp: Date.now(),
});

export const getUpdatedUser = id => {
  data.users[id].karma += 1;
  return getUser(id);
};
