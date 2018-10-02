import {zipObj} from 'ramda';
import {dataFns, sliceListByPage} from 'hn-react-redux-core';
import {delayedResponse} from './utils';
import data from './data.json';

const {getDescendants} = dataFns(data);

export const getList = (listId, page) => {
  const list = data.lists[listId];
  const pageItemIds = sliceListByPage(list, page);
  const pageItems = pageItemIds.map(itemId => data.items[itemId]);

  return delayedResponse({
    list,
    items: zipObj(pageItemIds, pageItems),
    timestamp: Date.now(),
  });
};

export const getDiscussion = rootId =>
  delayedResponse({
    items: getDescendants(rootId),
    timestamp: Date.now(),
  });

export const getuser = id =>
  delayedResponse({
    user: data.users[id],
    timestamp: Date.now(),
  });
