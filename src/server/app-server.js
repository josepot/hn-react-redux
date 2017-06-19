const express = require('express');
const path = require('path');
const fs = require('fs');
const R = require('ramda');
const lodashTemplate = require('lodash.template');
const {BROWSERS, COLORS, LISTS} = require('../config.js');

const staticFiles = require('./static-files.js');
const resources = require('./resources.js');

const {
  getListPage,
  getDiscussion,
  getUser,
  onListUpdate,
  onDiscussionUpdate,
  onUserUpdate,
} = require('./storage/background-sync.js');
const render = require('../client/entries/server/index.js').default;

const send404 = res => () => {
  res.status(404);
  res.send({error: 'Not found'});
};
function apiList(req, res) {
  const {listId, page} = req.params;
  getListPage(listId.toLowerCase(), parseInt(page, 10))
    .then(res.json.bind(res))
    .catch(send404(res));
}

function apiDiscussion(req, res) {
  getDiscussion(req.params.rootId).then(res.json.bind(res)).catch(send404(res));
}

function apiUser(req, res) {
  getUser(req.params.userId).then(res.json.bind(res)).catch(send404(res));
}

const pageTemplate = lodashTemplate(
  fs.readFileSync('dist/server/public/index.ejs', 'utf8')
);

const getShellRendered = R.once(() =>
  Promise.resolve(render('/shell', {lists: {}, items: {}, users: {}}))
    .then(R.omit(['initialState']))
);

function renderPage(req, res, next) {
  const {listId, itemId, page = '1'} = req.params;
  let promise;

  if (req.route.path === '/shell') {
    promise = getShellRendered();
  } else if (listId && R.prop(listId, LISTS)) {
    promise = getListPage(listId, parseInt(page, 10)).then(({list, items}) =>
      render(req.path, {lists: {[listId]: list}, items, users: {}})
    );
  } else if (itemId !== undefined) {
    promise = getDiscussion(itemId).then(({items}) =>
      render(req.path, {lists: {}, items, users: {}})
    );
  } else {
    return next();
  }

  return promise.then(({html, css, initialState}) => {
    const {application, vendor} = resources[req.userAgentType];
    const jsFiles = [
      `/dist/${req.userAgentType}/${vendor[0]}`,
      `/dist/${req.userAgentType}/${application[0]}`,
    ];

    const manifestEntries = req.userAgentType === BROWSERS.CHROME
      ? `
    <meta name="theme-color" content="${COLORS.PRIMARY.NORMAL}" />
    <link rel="manifest" href="/dist/chrome/manifest.json" />`
      : '';

    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      Connection: 'Transfer-Encoding',
      'Transfer-Encoding': 'chunked',
      'Strict-Transport-Security':
        'max-age=31557600; includeSubDomains; preload',
      'Timing-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Origin': '*',
    });

    const body = pageTemplate({
      html,
      css,
      initialState: initialState ? JSON.stringify(initialState) : 'undefined',
      jsFiles,
      manifestEntries,
    });

    res.write(body);
    res.end();
  });
}

function serviceWorker(req, res) {
  fs.readFile(path.resolve('dist', 'chrome', 'sw.js'), 'binary', (err, dta) => {
    res.writeHead(200, {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Timing-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Origin': '*',
    });

    res.end(dta, 'binary');
  });
}

const subscriptions = {};
const clearSubscriptors = (...keys) =>
  (subscriptions[keys.join('-')] = (subscriptions[keys.join('-')] || [])
    .filter(ws => ws.readyState < 2));
const getSubscription = (...keys) => subscriptions[keys.join('-')] || [];
const addSubscription = (ws, ...keys) => {
  const t = getSubscription(keys.join('-'));
  t.push(ws);
  subscriptions[keys.join('-')] = t;
};

const wsList = (ws, req) => {
  const {listId, page} = req.params;
  addSubscription(ws, 'list', listId, page);
};

onListUpdate((listId, page, list, items) => {
  const subscriptors = clearSubscriptors('list', listId, page);
  const message = JSON.stringify({list, items});

  subscriptors.forEach(ws => {
    if (ws.readyState === 1) ws.send(message);
  });
});

const wsDiscussion = (ws, req) => {
  addSubscription(ws, 'discussion', req.params.rootId);
};

onDiscussionUpdate((rootId, items) => {
  const message = JSON.stringify({items});
  const subscriptors = clearSubscriptors('discussion', rootId);

  subscriptors.forEach(ws => {
    if (ws.readyState === 1) ws.send(message);
  });
});

const wsUser = (ws, req) => {
  addSubscription(ws, 'user', req.params.userId);
};

onUserUpdate((userId, user) => {
  const message = JSON.stringify({user});
  const subscriptors = clearSubscriptors('user', userId);

  subscriptors.forEach(ws => {
    if (ws.readyState === 1) ws.send(message);
  });
});

module.exports = app => {
  app.get('/health', (req, res) => res.send({status: 'ok'}));

  app.ws('/api/subscription/list/:listId/:page', wsList);
  app.ws('/api/subscription/discussion/:rootId', wsDiscussion);
  app.ws('/api/subscription/user/:userId', wsUser);

  app.get('/api/list/:listId/:page', apiList);
  app.get('/api/discussion/:rootId', apiDiscussion);
  app.get('/api/user/:userId', apiUser);

  app.use('/static', express.static('public/static'));
  app.get('/dist/:classification/:file', staticFiles);

  app.get('/sw.js', serviceWorker);
  app.get('/shell', renderPage);

  app.get('/item/:itemId', renderPage);
  app.get('/:listId/:page?', renderPage);
  app.get('/', (req, res) => res.redirect('/top'));
};
