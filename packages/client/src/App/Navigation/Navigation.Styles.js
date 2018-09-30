import styled, {css} from 'react-emotion';

export const Header = styled('header')`
  height: 5vh;
  margin: 0;
  padding: 0;
  background-color: #f60;
`;

export const Nav = styled('nav')`
  margin: 0 auto;
  padding: 15px 5px;
  text-align: center;
`;

export const Link = styled('a')`
  color: white;
  line-height: 24px;
  display: inline-block;
  vertical-align: middle;
  margin-right: 1.8em;
  text-decoration: none;
  font-size: 1.25em;
`;

export const activeLink = css`
  font-weight: bold;
`;
