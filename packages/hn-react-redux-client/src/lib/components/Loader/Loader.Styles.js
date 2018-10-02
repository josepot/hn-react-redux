import {memoizeWith, identity} from 'ramda';
import styled, {keyframes} from 'react-emotion';

const scale = keyframes`
  30% {
    transform: scale(0.3);
  }

  100% {
    transform: scale(1)
  }
`;

const getMargiFromSize = memoizeWith(
  identity,
  size => Math.floor(size / 7) || 1
);

export const Ball = styled('div')(({idx, size, color = '#fff'}) => ({
  animation: `${scale} .75s ${idx *
    -0.12}s infinite cubic-bezier(.2,.68,.18,1.08)`,
  width: `${size}px`,
  height: `${size}px`,
  backgroundColor: color,
  borderRadius: '100%',
  margin: `${getMargiFromSize(size)}px`,
  display: 'inline-block',
}));

export const Wrapper = styled('div')(({$size}) => ({
  display: 'inline-block',
  margin: 'auto',
  width: `${getMargiFromSize($size) * 6 + $size * 3}px`,
}));
