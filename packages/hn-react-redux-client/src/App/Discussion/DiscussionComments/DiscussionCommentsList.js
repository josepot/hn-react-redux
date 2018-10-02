import React from 'react';
import {styled} from 'styletron-react';
import {branch, compose, pure, renderNothing, setDisplayName} from 'recompose';

import Comment from '../DiscussionComment';

const Wrapper = styled('ul', ({isRoot}) => ({
  marginLeft: isRoot ? 0 : '1.5em',
  listStyleType: 'none',
  padding: 0,
  margin: 0,
}));

const enhancer = compose(
  setDisplayName('DiscussionCommentsList'),
  renderNothingWhen(compose(either(isNil, isEmpty), prop('ids'))),
);

export default enhancer(({ids}) =>
  <Wrapper>{ids.map(id => <Comment id={id} key={id} />)}</Wrapper>
);
