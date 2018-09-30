import PropTypes from 'prop-types';
import React from 'react';
import {Loader} from 'components';
import {NavLink as ONavLink} from 'react-router-dom';
import {Link, Header} from './Item.Styles';

const NavLink = Link.withComponent(ONavLink);

const Item = ({id, title, author, price, isLoading, isSelected}) => (
  <article>
    <Header isSelected={isSelected}>
      <NavLink to={`/list/${isSelected ? '' : id}`}>{title}</NavLink>
    </Header>
    <Loader hidden={!isLoading} color="grey" size={20} />
    {isSelected && !isLoading ? (
      <div>
        <b>Author:</b> {author}
        <br />
        <b>Price:</b> {price}
      </div>
    ) : null}
  </article>
);

Item.propTypes = {
  id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  author: PropTypes.string,
  price: PropTypes.number,
  isLoading: PropTypes.bool.isRequired,
  isSelected: PropTypes.bool.isRequired,
};

export default Item;
