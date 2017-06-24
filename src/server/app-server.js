const express = require('express');
const path = require('path');
const fs = require('fs');
const R = require('ramda');
const lodashTemplate = require('lodash.template');
const {COLORS, LISTS} = require('../config.js');

const staticFiles = require('./static-files.js');
const jsAssets = require('./js-assets.js');

const {
  getListPage,
  getDiscussion,
  getUser,
} = require('./storage/background-sync.js');
const render = require('../client/entries/server/index.js').default;

const send404 = res => () => {
  res.status(404);
  res.send({error: 'Not found'});
};

function apiList(req, res) {
  const {listId, page} = req.params;
  getListPage(listId.toLowerCase(), parseInt(page, 10))
    .then(({list, items, timestamp}) => ({
      items,
      lists: {[listId]: list},
      users: {},
      timestamp,
    }))
    .then(res.json.bind(res))
    .catch(send404(res));
}

function apiDiscussion(req, res) {
  getDiscussion(req.params.rootId)
    .then(result => Object.assign(result, {lists: {}, users: {}}))
    .then(res.json.bind(res))
    .catch(send404(res));
}

function apiUser(req, res) {
  getUser(req.params.userId)
    .then(({user, timestamp}) => ({
      users: {[req.params.userId]: user},
      lists: {},
      items: {},
      timestamp,
    }))
    .then(res.json.bind(res))
    .catch(send404(res));
}

const pageTemplate = lodashTemplate(
  fs.readFileSync('dist/server/public/index.ejs', 'utf8')
);

const getShellRendered = R.once(() =>
  Promise.resolve(render('/shell', {lists: {}, items: {}, users: {}})).then(
    R.omit(['initialState'])
  )
);

function renderPage(req, res, next) {
  const {listId, itemId, page = '1'} = req.params;
  let promise;

  if (req.route.path === '/shell') {
    promise = getShellRendered();
  } else if (listId && R.prop(listId, LISTS)) {
    promise = getListPage(
      listId,
      parseInt(page, 10)
    ).then(({list, items, timestamp}) =>
      render(req.path, {lists: {[listId]: list}, items, users: {}, timestamp})
    );
  } else if (itemId !== undefined) {
    promise = getDiscussion(itemId).then(({items, timestamp}) =>
      render(req.path, {lists: {}, items, users: {}, timestamp})
    );
  } else {
    return next();
  }

  return promise.then(({html, css, initialState}) => {
    const {application, vendor} = jsAssets[req.userAgentType];
    const jsFiles = [vendor, application].map(
      fileName => `/dist/${req.userAgentType}/${fileName}`
    );

    const manifestEntries = `
<meta name="theme-color" content="${COLORS.PRIMARY.NORMAL}" />
<link rel="manifest" href="/dist/${req.userAgentType}/manifest.json" />
`;

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
  fs.readFile(
    path.resolve('dist', req.userAgentType, 'sw.js'),
    'binary',
    (err, dta) => {
      res.writeHead(200, {
        'Cache-Control': 'max-age=0',
        'Content-Type': 'application/javascript; charset=utf-8',
        'Timing-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Origin': '*',
      });

      res.end(dta, 'binary');
    }
  );
}

module.exports = app => {
  app.get('/health', (req, res) => res.send({status: 'ok'}));

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
