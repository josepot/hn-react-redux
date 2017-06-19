import React from 'react';
import {renderToString} from 'react-dom/server';
import StyletronServer from 'styletron-server';
import {StaticRouter} from 'react-router';

import App from '../App';
import Providers from '../Providers';
import rootReducer from '../root-reducer';
import configureStore from './store';

export default (url, data) => {
  const styletron = new StyletronServer();

  const staticRouter = new StaticRouter();
  staticRouter.props = {location: url, context: {}, basename: ''};
  const {props: {history}} = staticRouter.render();

  const store = configureStore(rootReducer, history, data);

  const html = renderToString(
    <Providers
      component={App}
      history={history}
      isSSR
      store={store}
      styletron={styletron}
    />
  );

  const css = styletron.getCss();
  const initialState = store.getState();

  return {html, css, initialState};
};
