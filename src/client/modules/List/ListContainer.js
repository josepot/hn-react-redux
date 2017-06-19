import R from 'ramda';
import {connect} from 'react-redux';
import {
  branch,
  compose,
  mapProps,
  renderComponent,
  setDisplayName,
  withProps,
} from 'recompose';

import {PAGE_SIZE, LISTS, LISTS_ORDER} from 'config';
import withDiffProps from 'lib/withDiffProps';
import {getListPageFactory} from 'modules/resources';
import NotFound from 'modules/NotFound';

import Component from './ListComponent';

const stateToProps = (state, {listId, page}) =>
  getListPageFactory(listId, page)(state);

export default compose(
  setDisplayName('ListContainer'),
  branch(
    ({match}) => !R.prop(match.params.listId, LISTS),
    renderComponent(NotFound)
  ),
  mapProps(({match: {params: {listId, page = '1'}}}) => {
    const pageNumber = parseInt(page, 10);
    const offset = (pageNumber - 1) * PAGE_SIZE + 1;
    return {listId, offset, page: pageNumber};
  }),
  connect(stateToProps),
  branch(
    ({ listItems, isLoading }) => listItems === null && !isLoading,
    renderComponent(NotFound)
  )
)(Component);
