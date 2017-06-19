import React from 'react';
import {compose, setDisplayName} from 'recompose';
import {styled} from 'styletron-react';
import withUrlData from 'lib/withUrlData';

const Wrapper = styled('span', {
  lineHeight: '20px',
});

const [Link, Text] = ['a', 'span'].map(c =>
  styled(c, {color: '#212121', fontSize: '1em'})
);

const Host = styled('span', ({isSafe}) => ({
  marginLeft: '10px',
  fontSize: '0.85em',
  color: isSafe === true ? '#168752' : isSafe === false ? '#bf360C' : '#212121',
}));

const enhancer = compose(setDisplayName('ListStoryTitle'), withUrlData);

export default enhancer(({text, url, domain, isSafe}) =>
  <Wrapper>
    {url
      ? [
          <Link key="link" target="_blank" rel="noopener" href={url}>
            {text}
          </Link>,
          <Host key="host" isSafe={isSafe}>{domain}</Host>,
        ]
      : <Text>{text}</Text>}
  </Wrapper>
);
