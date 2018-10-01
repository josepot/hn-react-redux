import React from 'react';
import {path, propEq} from 'ramda';
import {connect} from 'react-redux-lean';
import {
  branch,
  compose,
  mapProps,
  renderComponent,
  setDisplayName,
} from 'recompose';

import NotFound from 'components/NotFound';
import Loader from 'components/Loader';
import {getItemLoadingFactory} from 'modules/resources';
import Component from './DiscussionComponent';

export default compose(
  setDisplayName('DiscussionContainer'),
  mapProps(path(['match', 'params'])),
  connect({item: getItem}),
  branch(
    propEq('item', null),
    branch(
      propEq('isLoading', true),
      renderComponent(Loading),
      renderComponent(NotFound)
    )
  )
)(Component);

