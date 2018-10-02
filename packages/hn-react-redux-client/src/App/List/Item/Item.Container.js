import {connect} from 'react-redux-lean';
import {itemSelector} from 'modules/items';
import Item from './Item.Component';

export default connect(
  itemSelector,
  {}
)(Item);
