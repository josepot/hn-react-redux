import React from 'react';
import PropTypes from 'prop-types';
import {styled} from 'styletron-react';
import {Link as OriginalLink} from 'react-router-dom';

import {COLORS} from 'config';
import TimeAgo from 'lib/TimeAgo';

import Title from './ListStoryTitle';

const Wrapper = styled('li', {
  backgroundColor: 'white',
  padding: '20px 30px 20px 80px',
  borderBottom: '1px solid #eee',
  position: 'relative',
  lineHeight: '20px',
});

const Score = styled('span', {
  color: COLORS.PRIMARY.NORMAL,
  fontSize: '1.4em',
  fontWeight: 1000,
  position: 'absolute',
  top: '50%',
  left: 0,
  width: '80px',
  textAlign: 'center',
  marginTop: '-10px',
});

const Meta = styled('span', {
  fontSize: '0.95em',
  color: '#37474f',
  lineHeight: '25px',
});

const Link = styled(OriginalLink, {
  textDecoration: 'underline',
  color: 'inherit',
  ':hover': {
    color: COLORS.PRIMARY.NORMAL,
  },
});

export default function ListStoryComponent({rank, item }) {
  return item === null ? (<Wrapper><Score>Loading...</Score></Wrapper>) : (
    <Wrapper>
      <Score>{item.score}</Score>
      <Title text={`${rank} - ${item.title}`} url={item.url} />
      <br />
      <Meta>
        by {item.by} <TimeAgo time={item.time} /> |&nbsp;
        <Link to={`/item/${item.id}`}>
          {item.descendants || '0'} comments
        </Link>
      </Meta>
    </Wrapper>
  );
}

ListStoryComponent.propTypes = {
  rank: PropTypes.number.isRequired,
  item: PropTypes.object.isRequired,
};
