/* eslint-disable no-param-reassign */
const R = require('ramda');
const {sliceListByPage} = require('./common');
const {LISTS} = require('../../config.js');

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
  return isUpdate
    ? listWsCb(listId, page, list, items)
    : notifyListeners(listListeners[listId], page, {list, items});
}

function processDiscussionMessage({rootId, items, isUpdate}) {
  Object.assign(data.items, items);
  return isUpdate
    ? discussionWsCb(rootId, items)
    : notifyListeners(discussionListeners, rootId, {items});
}

function processUserMessage({userId, user, isUpdate}) {
  data.users[userId] = user;
  return isUpdate
    ? userWsCb(userId, user)
    : notifyListeners(userListeners, userId, {user});
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

  return pageItems.some(R.isNil)
    ? requestListPage(listId, page)
    : Promise.resolve({list, items: R.zipObj(pageItemIds, pageItems)});
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

  return Promise.resolve({items: getDescendants(root)});
}

function getUser(userId) {
  const user = data.users[userId];
  return user ? Promise.resolve({user}) : requestUser(userId);
}

module.exports = {
  getListPage,
  getDiscussion,
  getUser,
  onListUpdate,
  onDiscussionUpdate,
  onUserUpdate,
};
