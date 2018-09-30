import {createStore, applyMiddleware, compose} from 'redux';
import createSagaMiddleware from 'redux-saga';
import loggerMiddleware from 'redux-logger';
import {connectRouter, routerMiddleware} from 'connected-react-router';

const devMode = process.env.NODE_ENV !== 'production';

const sagaMiddleware = createSagaMiddleware();

const getMiddlewares = history => {
  const common = [routerMiddleware(history), sagaMiddleware];
  const dev = [loggerMiddleware];
  const prod = [];
  return [...common, ...(devMode ? dev : prod)];
};

const getEnhancers = () =>
  devMode && window.devToolsExtension ? [window.devToolsExtension()] : [];

export default (reducer, history, initialState) => {
  const store = compose(
    applyMiddleware(...getMiddlewares(history)),
    ...getEnhancers()
  )(createStore)(connectRouter(history)(reducer), initialState);
  store.runSaga = sagaMiddleware.run;
  return store;
};
