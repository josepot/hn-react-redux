import React from 'react';
import PropTypes from 'prop-types';
import {styled} from 'react-emotion';

import Header from './DiscussionHeader';
import Comments from './DiscussionComments';

const Wrapper = styled('div')`
  position: relative;
  max-width: 800px;
  margin: 65px auto 0 auto;
`;

const CommentsWrapper = styled(Wrappe)`
  background-color: #fff;
  margin-top: 10px;
  padding: 1.8em 2em 1em;
  box-shadow: 0 1px 2px rgba(0,0,0,.1);
`;

const CommentsTitle = styled('p')`
  margin: 0;
  font-size: 1.1em;
  padding: 1em 0;
  position: relative;
`;

export default function DiscussionComponent({item}) {
  return (
    <Wrapper>
      <Header {...item} />
      <CommentsWrapper>
        <CommentsTitle>{item.descendants} comments</CommentsTitle>
        <Comments isRoot ids={item.kids} />
      </CommentsWrapper>
    </Wrapper>
  );
}

DiscussionComponent.propTypes = {item: PropTypes.object.isRequired};

