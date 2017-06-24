/* eslint-disable no-param-reassign */
const R = require('ramda');
const {sliceListByPage} = require('./common');
const {LISTS} = require('../../config.js');
const getNow = require('lib/get-now-unix-time').default;

const listListeners = R.converge(R.zipObj, [
  R.keys,
  R.pipe(R.keys, R.map(R.always({}))),
])(LISTS);
const discussionListeners = {};
const userListeners = {};

const data = {
  items: {},
  lists: {},
  users: {},
};

let listWsCb = () => null;
const onListUpdate = fn => {
  listWsCb = fn;
};

let discussionWsCb = () => null;
const onDiscussionUpdate = fn => {
  discussionWsCb = fn;
};

let userWsCb = () => null;
const onUserUpdate = fn => {
  userWsCb = fn;
};

const queueListener = (dictionary, key, request) =>
  new Promise(resolve => {
    const listeners = R.propOr([], key, dictionary);
    listeners.push(resolve);
    dictionary[key] = listeners;

    if (listeners.length === 1) process.send(request);
  });

const notifyListeners = (dictionary, key, message) => {
  const listeners = R.propOr([], key, dictionary);
  listeners.forEach(resolve => resolve(message));
  dictionary[key] = [];
};

function processListMessage({listId, page, list, items, isUpdate}) {
  data.lists[listId] = list;
  Object.assign(data.items, items);
  const timestamp = getNow();
  return isUpdate
    ? listWsCb(listId, page, list, items, timestamp)
    : notifyListeners(listListeners[listId], page, {list, items, timestamp});
}

function processDiscussionMessage({rootId, items, isUpdate}) {
  Object.assign(data.items, items);
  const timestamp = getNow();
  return isUpdate
    ? discussionWsCb(rootId, items, timestamp)
    : notifyListeners(discussionListeners, rootId, {items, timestamp});
}

function processUserMessage({userId, user, isUpdate}) {
  data.users[userId] = user;
  const timestamp = getNow();
  return isUpdate
    ? userWsCb(userId, user, timestamp)
    : notifyListeners(userListeners, userId, {user, timestamp});
}

const processorsByType = {
  list: processListMessage,
  discussion: processDiscussionMessage,
  user: processUserMessage,
};

process.on('message', message => {
  const processor = processorsByType[message.type];
  if (processor) processor(message);
});

const requestListPage = (listId, page) =>
  queueListener(listListeners[listId], page, {type: 'list', listId, page});

const requestDiscussion = rootId =>
  queueListener(discussionListeners, rootId, {type: 'discussion', rootId});

const requestUser = userId =>
  queueListener(userListeners, userId, {type: 'user', userId});

const getListPage = (listId, page) => {
  const list = data.lists[listId];
  if (!list) return requestListPage(listId, page);

  const pageItemIds = sliceListByPage(list, page);
  const pageItems = pageItemIds.map(itemId => data.items[itemId]);
  const timestamp = getNow();

  return pageItems.some(R.isNil)
    ? requestListPage(listId, page)
    : Promise.resolve({
        list,
        items: R.zipObj(pageItemIds, pageItems),
        timestamp,
      });
};

const getDescendants = root =>
  !root.kids
    ? {[root.id]: root}
    : root.kids
        .map(itemId => data.items[itemId])
        .map(getDescendants)
        .reduce((res, obj) => Object.assign(res, obj), {[root.id]: root});

function getDiscussion(rootId) {
  const root = data.items[rootId];

  if (!root || (root.kids && root.kids.some(kid => !data.items[kid]))) {
    return requestDiscussion(rootId);
  }

  const timestamp = getNow();
  return Promise.resolve({items: getDescendants(root), timestamp});
}

function getUser(userId) {
  const user = data.users[userId];
  const timestamp = getNow();
  return user ? Promise.resolve({user, timestamp}) : requestUser(userId);
}

module.exports = {
  getListPage,
  getDiscussion,
  getUser,
  onListUpdate,
  onDiscussionUpdate,
  onUserUpdate,
};
