const R = require('ramda');
const URL = require('url');
const {LISTS} = require('../config.js');
const {
  onListUpdate,
  onDiscussionUpdate,
  onUserUpdate,
} = require('./storage/background-sync');

const subscriptions = {};
const maxIds = {};
const availableIds = {};

const getSubscriptions = resourceId =>
  R.values(subscriptions[resourceId] || {});

const getSubscriptionIdForResourceId = resourceId => {
  if (subscriptions[resourceId] === undefined) {
    subscriptions[resourceId] = {};
    maxIds[resourceId] = 1;
    availableIds[resourceId] = [];
    return 1;
  }
  return availableIds[resourceId].pop() || ++maxIdx[resourceId];
};

const subscribeMeTo = (ws, resourceId) => {
  const subscriptionId = getSubscriptionIdForResourceId(resourceId);
  subscriptions[resourceId][subscriptionId] = ws;

  const releaseSubscription = () => {
    delete subscriptions[resourceId][subscriptionId];
    availableIds[resourceId].push(subscriptionId);
  };
  return releaseSubscription;
};

const getResourceIdFromPath = path => {
  if (!path.startsWith('/api/subscription/')) return null;

  const [type, id, pageStr] = path.split('/').slice(3);
  if (type === 'discussion') return id ? `item-${id}` : null;
  if (type === 'user') return id ? `user-${id}` : null;

  if (type !== 'list') return null;

  const listId = LISTS[id];
  if (!listId) return null;
  const page = parseInt(pageStr || '1', 10);
  return isNaN(page) ? null : `list-${listId}-${page}`;
};

module.exports = function wsConnection(ws, req) {
  let resourceId = getResourceIdFromPath(URL.parse(req.url).pathname);
  if (!resourceId) return;

  let subscription = subscribeMeTo(ws, resourceId);
  ws.on('close', subscription);
  ws.on('message', newPath => {
    subscription();
    resourceId = getResourceIdFromPath(newPath);
    if (resourceId) subscription = subscribeMeTo(ws, resourceId);
  });
};

const sendUpdate = (resourceId, update) =>
  getSubscriptions(resourceId).forEach(ws => {
    if (ws.readyState === 1) ws.send(JSON.stringify(update));
  });

onListUpdate((listId, page, list, items) =>
  sendUpdate(`list-${listId}-${page}`, {list, items})
);
onDiscussionUpdate((rootId, items) => sendUpdate(`item-${rootId}`, {items}));
onUserUpdate((userId, user) => sendUpdate(`user-${userId}`, {user}));
