import {connect} from 'react-redux';
import {
  branch,
  compose,
  mapProps,
  renderNothing,
  setDisplayName,
} from 'recompose';

import {getComment} from 'modules/resources';
import Component from './DiscussionComment.Component';

export default compose(
  setDisplayName('DiscussionCommentContainer'),
  connect({comment: getComment}),
  branch(
    compose(either(isNil, prop('deleted')), prop('comment')),
    renderNothing,
    mapProps(prop('comment'))
  )
)(Component);

