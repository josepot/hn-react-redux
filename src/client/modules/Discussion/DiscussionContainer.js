import React from 'react';
import R from 'ramda';
import {connect} from 'react-redux';
import {
  branch,
  compose,
  mapProps,
  renderComponent,
  setDisplayName,
} from 'recompose';

import NotFound from 'modules/NotFound';
import {getItemLoadingFactory} from 'modules/resources';
import Component from './DiscussionComponent';

const Loading = () => <div>Loading...</div>;

const stateToProps = (state, {itemId}) => getItemLoadingFactory(itemId)(state);

export default compose(
  setDisplayName('DiscussionContainer'),
  mapProps(R.path(['match', 'params'])),
  connect(stateToProps),
  branch(
    R.propEq('item', null),
    branch(
      R.propEq('isLoading', true),
      renderComponent(Loading),
      renderComponent(NotFound)
    )
  )
)(Component);
