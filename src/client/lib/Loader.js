import React from 'react';
import {styled} from 'styletron-react';

const getMargiFromSize = size => Math.floor(size / 7) || 1;

const Ball = styled('div', ({ idx, size, color = '#fff' }) => ({
  animation: `scale .75s ${idx * -0.12}s infinite cubic-bezier(.2,.68,.18,1.08)`,
  width: `${size}px`,
  height: `${size}px`,
  backgroundColor: color,
  borderRadius: '100%',
  margin: `${getMargiFromSize(size)}px`,
  display: 'inline-block',
}));

const Wrapper = styled('div', ({ size }) => ({
  width: `${(getMargiFromSize(size) * 6) + (size * 3) }px`,
}));

export default function Loader({color, size, ...props}) {
  return <Wrapper size={size} {...props}>{[0, 1, 2].map(idx =>
    <Ball key={idx} idx={idx} size={size} color={color} />
  )}</Wrapper>;
}
