import R from 'ramda';
import {connect} from 'react-redux';
import {compose, setDisplayName} from 'recompose';
import {createSelector, createStructuredSelector} from 'reselect';

import Component from './HeaderComponent';

const getLocation = R.path(['router', 'location']);
const getFirstPathKey = createSelector(
  [getLocation],
  ({pathname}) => pathname.split('/')[1]
);

const mapStateToProps = createStructuredSelector({
  activeKey: getFirstPathKey,
});

export default compose(
  setDisplayName('HeaderContainer'),
  connect(mapStateToProps)
)(Component);
