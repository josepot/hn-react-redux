import {connectRouter} from 'connected-react-router';
import {createBrowserHistory} from 'history';
import React from 'react';
import ReactDOM from 'react-dom';
import {AppContainer} from 'react-hot-loader';
import Styletron from 'styletron-client';

import rootReducer from '../root-reducer';
import rootSaga from '../root-saga';
import configureStore from './store';
import Providers from '../Providers';
import App from '../App';

const history = createBrowserHistory();

const styleSheet = document.getElementById('styletronStyles');
const styletron = new Styletron([styleSheet]);

const render = (component, store) => {
  ReactDOM.render(
    <AppContainer>
      <Providers
        component={component}
        history={history}
        store={store}
        styletron={styletron}
      />
    </AppContainer>,
    document.getElementById('root')
  );
};

const store = configureStore(rootReducer, history, window.INITIAL_STATE);
store.sagaTask = store.runSaga(rootSaga);

render(App, store);

/* eslint-disable global-require */
if (module.hot) {
  module.hot.accept(['../App', '../root-reducer', '../root-saga'], () => {
    store.replaceReducer(
      connectRouter(history)(require('../root-reducer').default)
    );
    store.sagaTask.cancel();
    store.sagaTask.done.then(() => {
      store.sagaTask = store.runSaga(require('../root-saga').default);
      render(require('../App').default, store);
    });
  });
}
