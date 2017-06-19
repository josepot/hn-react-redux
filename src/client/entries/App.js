import React from 'react';
import PropTypes from 'prop-types';
import {Redirect, Switch, Route} from 'react-router';

import Header from 'modules/Header';
import List from 'modules/List';
import NotFound from 'modules/NotFound';
import Discussion from 'modules/Discussion';

export default function App({isSSR}) {
  return (
    <div>
      <Header />
      <main>
        <Switch>
          <Route exact path="/item/:itemId" component={Discussion} />
          <Route
            exact
            path="/shell"
            render={() => (isSSR ? null : <Redirect to="/top" />)}
          />
          <Route exact path="/:listId/:page?" component={List} />
          <Route exact path="/" render={() => <Redirect to="/top" />} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

App.propTypes = {
  isSSR: PropTypes.bool.isRequired,
};
