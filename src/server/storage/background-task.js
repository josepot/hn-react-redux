/* eslint-disable no-plusplus */
const cluster = require('cluster');
const winston = require('winston');
const R = require('ramda');
const fetch = require('node-fetch');
const Heap = require('fastpriorityqueue');

const {sliceListByPage} = require('./common');
const {LISTS, PAGE_SIZE} = require('../../config.js');

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

const data = {
  items: {},
  lists: {},
  users: {},
};

const requestAndPersist = (storageKey, id, url, priority) =>
  getRequest(...args).then(tap(x => data[storageKey][id] = x));

const getItemRequest = (itemId, priority) =>
  requestAndPersist('items', itemId, `${END_POINTS.ITEM}${itemId}.json`, priority);

const getListRequest = (listId, priority) =>
  requestAndPersist('lists', listId, END_POINTS[LISTS[listId]], priority);

const getUserRequest = (userId, priority) =>
  requestAndPersist('users', userId, `${END_POINTS.USER}${userId}.json`, priority);

const getList = listId =>
  data.lists[listId]
    ? Promise.resolve(data.lists[listId])
    : getListRequest(++latestBatchId, Infinity, listId);

const getItem = (batchId, priority) => itemId =>
  data.items[itemId]
    ? Promise.resolve(data.items[itemId])
    : getItemRequest(batchId, priority, itemId);

const getUser = (batchId, priority) => userId =>
  data.users[userId]
    ? Promise.resolve(data.users[userId])
    : getUserRequest(batchId, priority, userId);

const getDescendants = (batchId, priority) => root =>
  !root
    ? {}
    : !root.kids
      ? Promise.resolve({[root.id]: root})
      : Promise.all(
          root.kids.map(
            R.pipeP(
              getItem(batchId, priority),
              getDescendants(batchId, priority)
            )
          )
        ).then(
          R.reduce((res, obj) => Object.assign(res, obj), {[root.id]: root})
        );

const getDescendantsSync = root =>
  !root
    ? {}
    : !root.kids
      ? {[root.id]: root}
      : root.kids
          .map(itemId => data.items[itemId])
          .map(getDescendantsSync)
          .reduce((res, obj) => Object.assign(res, obj), {[root.id]: root});

const requestDiscussion = (rootId, priority, sendFn) => {
  const batchId = ++latestBatchId;
  return R.pipeP(getItem(batchId, priority), getDescendants(batchId, priority))(
    rootId
  ).then(() => {
    if (!sendFn) return;
    const root = data.items[rootId];
    sendFn({
      type: 'discussion',
      rootId,
      items: getDescendantsSync(root),
    });
  });
};

const broadcast = message => {
  Object.keys(cluster.workers).forEach(wId =>
    cluster.workers[wId].send(Object.assign(message, {isUpdate: true}))
  );
};

const requestListPage = (listId, page, priority, sendFn) =>
  getList(listId).then(ids =>
    Promise.all(
      sliceListByPage(ids, page).map(getItem(++latestBatchId, priority))
    ).then(() => {
      if (!sendFn) return;
      const list = data.lists[listId];
      const items = R.pick(sliceListByPage(list, page), data.items);
      const message = {type: 'list', listId, page, list, items};
      sendFn(message);
    })
  );

const requestUser = (userId, priority, sendFn) =>
  getUser(++latestBatchId, priority)(userId).then(() => {
    if (!sendFn) return;
    sendFn({type: 'user', userId, user: data.users[userId]});
  });

const initialSeed = () =>
  Promise.all(
    R.values(LISTS).map(listId =>
      getList(listId).then(listItems => {
        const nPages = Math.ceil(listItems.length / PAGE_SIZE);
        const listPromises = R.range(1, nPages + 1).map(page =>
          requestListPage(listId, page, 3)
        );
        const discussionPromisses = listItems.map(itemId =>
          requestDiscussion(itemId, 1)
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
  return R.range(1, nPages + 1).filter(
    page =>
      !R.equals(sliceListByPage(oldList, page), sliceListByPage(newList, page))
  );
};

let latestUpdates = {};
const update = delay => {
  const batchId = ++latestBatchId;
  const start = new Date().getTime();
  const listIds = R.values(LISTS);
  const priority = 10;

  getRequest(batchId, priority, END_POINTS.UPDATES, 'updates')
    .then(updates => {
      if (R.equals(updates, latestUpdates)) return null;
      latestUpdates = updates;

      return Promise.all([
        Promise.all(
          (updates.items || [])
            .map(itemId => getItemRequest(batchId, priority, itemId))
        ),
        Promise.all(
          listIds.map(listId =>
            getListRequest(batchId, priority, listId, false)
          )
        ),
        Promise.all(
          (updates.profiles || [])
            .map(userId => getUserRequest(batchId, priority, userId))
        ),
      ]);
    })
    .then(updates => {
      if (updates === null) return;
      const [items, newLists, users] = updates;
      const listChanges = listIds
        .map((listId, idx) => [listId, data.lists[listId], newLists[idx]])
        .map(([listId, oldList, newList]) => {
          if (R.equals(oldList, newList)) return [listId, []];

          const changes = getListChanges(oldList || [], newList);
          data.lists[listId] = newList;
          return [listId, changes];
        });
      const discussionChanges = items.filter(item => !item.parent);

      listChanges.forEach(([listId, pages]) =>
        pages.forEach(page => requestListPage(listId, page, 5, broadcast))
      );

      discussionChanges.forEach(({id}) => requestDiscussion(id, 5, broadcast));
      users.forEach(userId => requestUser(userId, 5, broadcast));
    })
    .catch(e => {
      logger.error('An unexpected error occurred whild running the updates', e);
      logger.error(e.message);
      logger.error(e.stack);
    })
    .then(() => {
      const waitFor = Math.max(0, delay - (new Date().getTime() - start));
      setTimeout(update, waitFor, delay);
    });
};

const healthCheck = delay => {
  const nQueuedRequests = Object.keys(queuedRequests).length;
  logger.info(
    `Health Check: There are ${Object.keys(data.items).length} items`
  );
  logger.info(`Health Check: There are ${nQueuedRequests} queued requests`);
  logger.info(`Health Check: Is the queue empty? ${queue.isEmpty()}`);
  logger.info(`Health Check: There are ${nIdle} threats iddle`);
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
    initialSeed();
  }
  if (withUpdates) update(8000);
  if (withHealthCheck) healthCheck(30000);
};
