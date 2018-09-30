const cluster = require('cluster');
const winston = require('winston');
const {__, complement, equals, isNil, propOr, range, tap} = require('ramda');

const {sliceListByPage} = require('../common');
const {LISTS, PAGE_SIZE} = require('../../config');
const {
  setLogger,
  getRequest,
  healthCheck: requestsHC,
} = require('./get-request');

const LIST_IDS = Object.values(LISTS);

const END_POINTS = Object.freeze({
  [LISTS.top]: 'https://hacker-news.firebaseio.com/v0/topstories.json',
  [LISTS.new]: 'https://hacker-news.firebaseio.com/v0/newstories.json',
  [LISTS.show]: 'https://hacker-news.firebaseio.com/v0/showstories.json',
  [LISTS.ask]: 'https://hacker-news.firebaseio.com/v0/askstories.json',
  [LISTS.jobs]: 'https://hacker-news.firebaseio.com/v0/jobstories.json',
  UPDATES: 'https://hacker-news.firebaseio.com/v0/updates.json',
  ITEM: 'https://hacker-news.firebaseio.com/v0/item/',
  USER: 'https://hacker-news.firebaseio.com/v0/user/',
});

const logger = new winston.Logger({
  exitOnError: false,
  transports: [
    new winston.transports.Console({
      level: 'info',
      handleExceptions: true,
      humanReadableUnhandledException: true,
    }),
    new winston.transports.File({
      level: 'info',
      filename: 'background-task.log',
      handleExceptions: true,
      humanReadableUnhandledException: true,
    }),
  ],
});
setLogger(logger);

const data = {
  items: {},
  lists: {},
  users: {},
};

const broadcast = message => {
  Object.keys(cluster.workers).forEach(wId =>
    cluster.workers[wId].send(Object.assign({isUpdate: true}, message))
  );
};

const requestAndPersist = (storageKey, id, url, priority) =>
  getRequest(id, url, priority).then(
    tap(x => {
      data[storageKey][id] = x;
    })
  );

const itemRequest = (itemId, priority) =>
  requestAndPersist(
    'items',
    itemId,
    `${END_POINTS.ITEM}${itemId}.json`,
    priority
  );

const listRequest = (listId, priority, persist = true) =>
  persist
    ? requestAndPersist('lists', listId, END_POINTS[LISTS[listId]], priority)
    : getRequest(listId, END_POINTS[LISTS[listId]], priority);

const userRequest = (userId, priority) =>
  requestAndPersist(
    'users',
    userId,
    `${END_POINTS.USER}${userId}.json`,
    priority
  );

const getList = listId =>
  data.lists[listId]
    ? Promise.resolve(data.lists[listId])
    : listRequest(listId, Infinity);

const getItem = (itemId, priority) =>
  data.items[itemId]
    ? Promise.resolve(data.items[itemId])
    : itemRequest(itemId, priority);

const getUser = (userId, priority) =>
  data.users[userId]
    ? Promise.resolve(data.users[userId])
    : userRequest(userId, priority);

const getDescendants = async (rootId, priority) => {
  let item;
  try {
    item = await getItem(rootId, priority);
    if (!item) return {};
  } catch (e) {
    return {};
  }
  const descendants = await Promise.all(
    (item.kids || []).map(id => getDescendants(id, priority))
  );

  return descendants.reduce((res, obj) => Object.assign(res, obj), {
    [rootId]: item,
  });
};

const getDescendantsSync = root =>
  (root.kids || [])
    .map(propOr(null, __, data.items))
    .filter(complement(isNil))
    .map(getDescendantsSync)
    .reduce((res, obj) => Object.assign(res, obj), {[root.id]: root});

const requestListPage = async (listId, page, priority, sendFn) => {
  const list = await getList(listId);
  const pageIds = sliceListByPage(list, page);
  const items = await Promise.all(pageIds.map(x => getItem(x, priority)));
  sendFn({type: 'list', listId, page, list, items});
};

const requestUser = async (userId, priority, sendFn) => {
  const user = await getUser(userId, priority);
  sendFn({type: 'user', userId, user});
};

const requestDiscussion = async (rootId, priority, sendFn) => {
  const items = await getDescendants(rootId, priority);
  sendFn({type: 'discussion', rootId, items});
};

const initialSeed = () =>
  Promise.all(
    LIST_IDS.map(listId =>
      getList(listId).then(listItems => {
        const nPages = Math.ceil(listItems.length / PAGE_SIZE);
        const listPromises = range(1, nPages + 1).map(page =>
          requestListPage(listId, page, 3, broadcast)
        );
        const discussionPromisses = listItems.map(itemId =>
          requestDiscussion(itemId, 1, broadcast)
        );
        return Promise.all([...listPromises, ...discussionPromisses]);
      })
    )
  ).then(() => {
    logger.info('initialSeed completed');
  });

const getListChanges = (oldList, newList) => {
  const maxLen = Math.max(oldList.length, newList.length);
  const nPages = Math.ceil(maxLen / PAGE_SIZE);
  return range(1, nPages + 1).filter(
    page =>
      !equals(sliceListByPage(oldList, page), sliceListByPage(newList, page))
  );
};

let latestUpdates = {};

const update = async delay => {
  const start = new Date().getTime();
  const priority = 10;

  try {
    const updates = await getRequest('updates', END_POINTS.UPDATES, 10);
    if (equals(updates, latestUpdates)) return null;
    latestUpdates = updates;

    const [items, newLists, users] = await Promise.all([
      Promise.all((updates.items || []).map(x => itemRequest(x, priority))),
      Promise.all(LIST_IDS.map(x => listRequest(x, priority, false))),
      Promise.all((updates.profiles || []).map(x => userRequest(x, priority))),
    ]);

    const discussionChanges = items.filter(item => !item.parent);

    const listChanges = LIST_IDS.map((listId, idx) => [
      listId,
      data.lists[listId],
      newLists[idx],
    ]).map(([listId, oldList, newList]) => {
      if (equals(oldList, newList)) return [listId, []];

      data.lists[listId] = newList;
      return [listId, getListChanges(oldList || [], newList)];
    });

    listChanges.forEach(([listId, pages]) =>
      pages.forEach(page => requestListPage(listId, page, 5, broadcast))
    );
    discussionChanges.forEach(({id}) => requestDiscussion(id, 5, broadcast));
    users.forEach(userId => requestUser(userId, 5, broadcast));
  } catch (e) {
    logger.error('An unexpected error occurred whild running the updates', e);
    logger.error(e.message);
    logger.error(e.stack);
  } finally {
    const waitFor = Math.max(0, delay - (new Date().getTime() - start));
    setTimeout(update, waitFor, delay);
  }
  return null;
};

const healthCheck = delay => {
  requestsHC();
  logger.info(
    `Health Check: There are ${Object.keys(data.items).length} items`
  );
  setTimeout(healthCheck, delay, delay);
};

const processorsByType = {
  list: ({listId, page}, sendFn) => requestListPage(listId, page, 7, sendFn),
  discussion: ({rootId}, sendFn) => requestDiscussion(rootId, 7, sendFn),
  user: ({userId}, sendFn) => requestUser(userId, 7, sendFn),
};

module.exports = (
  {withSeed = false, withUpdates = false, withHealthCheck = true} = {}
) => {
  cluster.on('message', (worker, message) => {
    const processor = processorsByType[message.type];
    if (processor) processor(message, worker.send.bind(worker));
  });

  if (withSeed) {
    logger.info('initialSeed started');
    initialSeed().then(() => {
      if (withUpdates) update(10000);
    });
  }
  if (withUpdates && !withSeed) update(10000);
  if (withHealthCheck) healthCheck(45000);
};
