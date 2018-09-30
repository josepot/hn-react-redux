import {connect} from 'react-redux-lean';
import {compose} from 'recompose';

import {withOnScrollBottom} from 'hocs';
import {idsListSelector as itemIds, requestItems} from 'modules/items';
import Component from './List.Component';

export default compose(
  connect(
    {itemIds},
    {onScrollBottom: requestItems}
  ),
  withOnScrollBottom
)(Component);
