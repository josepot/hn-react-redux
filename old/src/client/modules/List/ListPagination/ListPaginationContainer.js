import R from 'ramda';
import {connect} from 'react-redux';
import {compose, branch, renderNothing} from 'recompose';
import {getListTotalPagesFactory} from 'modules/resources';
import Component from './ListPaginationComponent';

export default compose(
  connect((state, {listId}) => ({
    total: getListTotalPagesFactory(listId)(state),
  })),
  branch(R.propEq('total', 0), renderNothing)
)(Component);
