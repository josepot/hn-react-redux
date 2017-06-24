import React from 'react';
import PropTypes from 'prop-types';
import {styled} from 'styletron-react';
import {Link as RouterLink} from 'react-router-dom';

const Wrapper = styled('div', {
  padding: '15px 30px',
  position: 'fixed',
  textAlign: 'center',
  top: '55px',
  left: 0,
  right: 0,
  zIndex: 998,
  boxShadow: '0 1px 2px rgba(0,0,0,.1)',
  backgroundColor: 'white',
  borderRadius: '2px',
});

const InnerLink = styled('span', {
  margin: '0 1.2em',
});

function PaginationLink({to, children}) {
  const inner = <InnerLink>{children}</InnerLink>;
  return to ? <RouterLink to={to}>{inner}</RouterLink> : inner;
}

PaginationLink.propTypes = {
  to: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default function ListPagination({listId, current, total}) {
  return (
    <Wrapper>
      <PaginationLink to={current > 1 ? `/${listId}/${current - 1}` : null}>
        prev
      </PaginationLink>
      <span>{current}/{total}</span>
      <PaginationLink to={current < total ? `/${listId}/${current + 1}` : null}>
        next
      </PaginationLink>
    </Wrapper>
  );
}

ListPagination.propTypes = {
  listId: PropTypes.string.isRequired,
  current: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
};
