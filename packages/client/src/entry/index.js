import React from 'react';
import ReactDOM from 'react-dom';

import reducer from 'modules/root-reducer';
import rootSaga from 'modules/root-saga';
import {history} from 'modules/router';
import App from 'App';

import configureStore from './store';
import Providers from './Providers';

export const render = (AppComponent, store) => {
  ReactDOM.render(
    <Providers store={store} history={history}>
      <AppComponent />
    </Providers>,
    document.getElementById('root')
  );
};

export const store = configureStore(reducer);
store.sagaTask = store.runSaga(rootSaga);

render(App, store);

if (process.env.NODE_ENV !== 'production' && module.hot) {
  module.hot.accept(
    ['../App', '../modules/root-reducer', '../modules/root-saga'],
    () => {
      store.replaceReducer(reducer);
      store.sagaTask.cancel();
      store.sagaTask.done.then(() => {
        store.sagaTask = store.runSaga(rootSaga);
        render(App, store);
      });
    }
  );
}
