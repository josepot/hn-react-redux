import {always} from 'ramda';
import React from 'react';
import {Redirect, Switch, Route} from 'react-router';

import Header from 'modules/Header';
import List from 'modules/List';
import NotFound from 'modules/NotFound';
import Discussion from 'modules/Discussion';

export default function App() {
  return (
    <div>
      <Header />
      <main>
        <Switch>
          <Route exact path="/shell" render={always(null)} />
          <Route exact path="/item/:itemId" component={Discussion} />
          <Route exact path="/:listId/:page?" component={List} />
          <Redirect from="/" exact to="/top" />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}
