import {connect} from 'react-redux';
import {compose, mapProps, setDisplayName} from 'recompose';

import {getItemFactory} from 'modules/resources';

import Component from './ListStoryComponent';

const stateToProps = (state, {itemId}) => ({
  item: getItemFactory(itemId)(state),
});

export default compose(
  setDisplayName('ListStoryContainer'),
  connect(stateToProps),
  mapProps(({ item, rank }) => ({
    rank,
    item: item || {
      score: 'Loading...',
      title: 'Loading...',
      url: 'https://www.google.com/rocks',
      by: 'loading',
      time: 234234,
      id: 'id',
    },
  }))
)(Component);
