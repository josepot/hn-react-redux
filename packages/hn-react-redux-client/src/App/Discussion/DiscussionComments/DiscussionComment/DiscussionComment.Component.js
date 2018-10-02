import React from 'react';
import PropTypes from 'prop-types';
import {styled} from 'styletron-react';
import TimeAgo from 'lib/TimeAgo';
import Comments from '../DiscussionComments';

export default function DiscussionCommentComponent({by, time, text, kids}) {
  return (
    <Wrapper>
      <By>{by} <TimeAgo time={time} /></By>
      <Text dangerouslySetInnerHTML={{__html: text}} />
      <Toogle>[-]</Toogle>
      <Comments ids={kids} />
    </Wrapper>
  );
}

DiscussionCommentComponent.propTypes = {
  by: PropTypes.string.isRequired,
  time: PropTypes.number.isRequired,
  text: PropTypes.string.isRequired,
  kids: PropTypes.arrayOf(PropTypes.number).isRequired,
};

