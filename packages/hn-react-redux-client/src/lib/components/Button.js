import styled from 'react-emotion';

export default styled('button')`
  background-color: ${({disabled}) => (disabled ? 'grey' : '#0078e7')};
  color: #fff;
  padding: 0.5em 1em;
  text-decoration: none;
  border-radius: 2px;
  display: inline-block;
  text-align: center;
  cursor: pointer;
`;
