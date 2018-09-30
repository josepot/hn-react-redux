import React from 'react';
import {styled} from 'styletron-react';
import {compose, nest, setDisplayName} from 'recompose';
import TimeAgo from 'lib/TimeAgo';
import withUrlData from 'lib/withUrlData';

const Wrapper = styled('div', {
  backgroundColor: '#fff',
  padding: '1.8em 2em 1em',
  boxShadow: '0 1px 2px rgba(0,0,0,.1)',
});

const InnerTitle = styled('h1', {
  display: 'inline',
  fontSize: '1.5em',
  margin: 0,
  marginRight: '0.5em',
});

const Host = styled('span', {color: '#828282'});
const Meta = styled('p', {color: '#828282'});

const enhancer = compose(setDisplayName('DiscussionHeader'), withUrlData);

export default enhancer(({by, domain, time, title, url}) => {
  const Title = url ? nest('a', InnerTitle) : InnerTitle;

  return (
    <Wrapper>
      <Title href={url} target="_blank">{title}</Title>
      <Host>({domain})</Host>
      <Meta>
        by {by} <TimeAgo time={time} />
      </Meta>
    </Wrapper>
  );
});

