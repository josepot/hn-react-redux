import styled from 'react-emotion';

export const Link = styled('a')`
  text-decoration: none;
  color: #34495e;
`;

export const Header = styled('header')(({isSelected}) => ({
  lineHeight: '20px',
  fontSize: '16px',
  fontWeight: isSelected ? 'bold' : 'normal',
  marginBottom: isSelected ? '20px' : '0',
}));
