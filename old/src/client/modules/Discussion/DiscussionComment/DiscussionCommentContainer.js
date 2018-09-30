import {connect} from 'react-redux';
import {
  branch,
  compose,
  mapProps,
  renderNothing,
  setDisplayName,
} from 'recompose';

import {getItemFactory} from 'modules/resources';
import Component from './DiscussionCommentComponent';

export default compose(
  setDisplayName('DiscussionCommentContainer'),
  connect((state, {id}) => ({item: getItemFactory(id)(state)})),
  branch(
    ({item}) => item === null || item.deleted,
    renderNothing,
    mapProps(({item}) => ({...item}))
  )
)(Component);
