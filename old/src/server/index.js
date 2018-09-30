const compression = require('compression');
const express = require('express');
const helmet = require('helmet');
const http = require('http');
const throng = require('throng');
const WS = require('ws');

const master = require('./master');

const classifyBrowser = require('./plugins/classifyBrowser');
const nodeAppServer = require('./app-server');
const wsConnection = require('./subscriptions');

const start = id => {
  const app = express();
  const PORT = (parseInt(process.env.PORT, 10) || 1917) + (id - 1);

  app.use(helmet());
  app.use(compression());
  app.use(classifyBrowser());

  nodeAppServer(app);
  const server = http.createServer(app);
  const wss = new WS.Server({server});
  wss.on('connection', wsConnection);

  server.listen(
    PORT,
    err =>
      err
        ? /* eslint-disable no-console */
          console.error(err)
        : console.log(`Listening on port ${PORT}`)
  );
};

const throngOptions = process.env.NODE_ENV === 'production'
  ? {
      master: () => master({withSeed: true, withUpdates: true}),
      start,
    }
  : {
      workers: 1,
      master: () => master({withSeed: true, withUpdates: true}),
      start,
    };

throng(throngOptions);
