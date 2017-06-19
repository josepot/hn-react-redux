const compression = require('compression');
const express = require('express');
const helmet = require('helmet');
const throng = require('throng');
const expressWs = require('express-ws');

const backgroundTask = require('./storage/background-task');

const sslEnforcer = require('./plugins/ssl-enforce');
const classifyBrowser = require('./plugins/classifyBrowser');
const nodeAppServer = require('./app-server');

const start = (id) => {
  const app = express();
  expressWs(app);
  const PORT = (parseInt(process.env.PORT, 10) || 1917) + (id - 1);

  app.use(sslEnforcer);
  app.use(helmet());
  app.use(compression());
  app.use(classifyBrowser());

  nodeAppServer(app);
  app.listen(
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
      master: () => backgroundTask({withSeed: true, withUpdates: true}),
      start,
    }
  : {
      workers: 1,
      master: () => backgroundTask({withUpdates: true}),
      start,
    };

throng(throngOptions);
