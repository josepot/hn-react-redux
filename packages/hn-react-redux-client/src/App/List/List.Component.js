import React from 'react';
import PropTypes from 'prop-types';

import {Ul, Li} from './List.Styles';
import ListLoader from './ListLoader';
import Item from './Item';

const getListItem = id => (
  <Li key={id}>
    <Item id={id} />
  </Li>
);

const ItemsList = ({itemIds, onScroll}) => (
  <Ul onScroll={onScroll}>
    {itemIds.map(getListItem)}
    <Li center>
      <ListLoader size={30} color="grey" />
    </Li>
  </Ul>
);

ItemsList.propTypes = {
  itemIds: PropTypes.arrayOf(PropTypes.number),
  onScroll: PropTypes.func,
};

export default ItemsList;
