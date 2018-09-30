import {always} from 'ramda';
import React from 'react';
import {Redirect, Switch, Route} from 'react-router';

import Discussion from './Discussion';
import Header from './Header';
import List from './List';
import NotFound from './NotFound';

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
