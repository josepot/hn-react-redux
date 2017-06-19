import React from 'react';
import PropTypes from 'prop-types';
import {styled} from 'styletron-react';
import TimeAgo from 'lib/TimeAgo';
import Comments from '../DiscussionComments';

const Wrapper = styled('li', {
  borderTop: '1px solid #eee',
  position: 'relative',
  listStyleType: 'none',
});

const By = styled('div', {
  color: '#828282',
  fontSize: '0.9em',
  margin: '1em 0',
});

const Text = styled('div', {
  overflowWrap: 'break-word',
  fontSize: '0.9em',
  margin: '1em 0',
});

const Toogle = styled('div', {
  padding: 0,
  backgroundColor: 'transparent',
  marginBottom: '-0.5em',
  fontSize: '0.9em',
  margin: '1em 0',
});

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
