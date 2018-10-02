import {prop} from 'ramda';
import React from 'react';
import PropTypes from 'prop-types';
import {renderNothingWhen} from 'hocs';
import {Ball, Wrapper} from './Loader.Styles';

const enhancer = renderNothingWhen(prop('hidden'));

const DotsLoader = enhancer(({color, size}) => (
  <Wrapper $size={size}>
    {[0, 1, 2].map(idx => (
      <Ball key={idx} idx={idx} size={size} color={color} />
    ))}
  </Wrapper>
));

DotsLoader.displayName = 'DotsLoader';
DotsLoader.defaultProps = {
  hidden: false,
  color: 'grey',
};
DotsLoader.propTypes = {
  hidden: PropTypes.bool,
  color: PropTypes.string,
  size: PropTypes.number.isRequired,
};

export default DotsLoader;
