import React from 'react';
import PropTypes from 'prop-types';

import {ConnectedRouter} from 'connected-react-router';
import {StyletronProvider} from 'styletron-react';
import {Provider as ReduxProvider} from 'react-redux';

import NowProvider from 'lib/NowProvider';

export default function Providers({
  component: App,
  history,
  store,
  styletron,
  isSSR = false,
}) {
  return (
    <StyletronProvider styletron={styletron}>
      <ReduxProvider store={store}>
        <ConnectedRouter history={history}>
          <NowProvider>
            <App isSSR={isSSR} />
          </NowProvider>
        </ConnectedRouter>
      </ReduxProvider>
    </StyletronProvider>
  );
}

Providers.propTypes = {
  component: PropTypes.any.isRequired,
  history: ConnectedRouter.propTypes.history,
  isSSR: PropTypes.bool,
  store: ReduxProvider.propTypes.store,
  styletron: PropTypes.object.isRequired,
};
