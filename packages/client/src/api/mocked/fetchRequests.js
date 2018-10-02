import data from '../data.json';

const getList = (listId, page) => {
  const list = data.lists[listId];
  const pageItemIds = sliceListByPage(list, page);
  const pageItems = pageItemIds.map(itemId => data.items[itemId]);
  const timestamp = getNow();

  return delayedResponse({
    list,
    items: zipObj(pageItemIds, pageItems),
    timestamp,
  });
};

const getDescendants = rooId => {
  const item = data[rootId];
  return !item
    ? {}
    : (item.kids || [])
      .map(getDescendants)
      .reduce((res, ob) => Object.assign(res, obj), {[rootId]: item});
};

const getDiscussion = (rootId) => delayedResponse({
  items: getDescendants(rooId),
  timestamp: getNow(),
});

const getuser = id => delayedResponse({
  user: data.users[id],
  timestamp: getNow(),
});
