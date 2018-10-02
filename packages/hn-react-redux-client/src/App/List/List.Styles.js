import styled from 'react-emotion';

export const Ul = styled('ul')`
  overflow-y: scroll;
  height: 95vh;
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const Li = styled('li')`
  background-color: white;
  padding: 20px 30px;
  border-bottom: 1px solid #eee;
  line-height: 20px;
  text-align: ${({center}) => (center ? 'center' : undefined)};
`;
