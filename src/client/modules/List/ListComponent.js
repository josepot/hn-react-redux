import R from 'ramda';
import React from 'react';
import PropTypes from 'prop-types';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import AnimationGroup from 'lib/AnimationGroup';
import withTransitions from 'lib/withTransitions';
import Loader from 'lib/Loader';
import {COLORS} from 'config';
import {styled} from 'styletron-react';
import {branch, compose, pure, renderNothing} from 'recompose';

import Story from './ListStory';
import Pagination from './ListPagination';

const Wrapper = styled('div', {
  position: 'relative',
  paddingTop: '90px',
  maxWidth: '800px',
  margin: '0 auto',
});

const ListWrapper = styled('ul', {
  position: 'absolute',
  padding: 0,
  top: '110px',
  left: 0,
  width: '100%',
  backgroundColor: 'white',
  borderRadius: '2px',
  listStyleType: 'none',
  overflow: 'hidden',
});

const withStyles = styles => Component => styled(Component, styles);

const ListItems = compose(
  withTransitions(300, 300),
  withStyles(({id, transitionState}) => {
    return {
      opacity: transitionState === 'NORMAL' ? 1 : 0,
      transition:  transitionState === 'INIT'
        ? ''
        : 'all .5s ease-in-out',
    };
  })
)(({listItems, offset, ...styles}) =>
  <AnimationGroup {...styles} component={ListWrapper}>{
    listItems.map((itemId, idx) =>
      <Story rank={offset + idx} itemId={itemId} key={itemId} />
    )}
  </AnimationGroup>
);

const Loading = compose(
  withTransitions(300, 300),
  withStyles(({transitionState}) => ({
    margin: '40px auto',
    opacity: transitionState === 'NORMAL' ? 1 : 0,
    transition: transitionState === 'INIT'
      ? ''
      : 'all .3s ease-in-out'
  }))
)(({...styles}) =>
  <Loader {...styles} size={30} color={COLORS.SECONDARY.DARK} />
);

const List = pure(({listId, page, isLoading, listItems, offset}) =>
  <TransitionGroup component="div">
    {!isLoading ? <ListItems key={`${listId}-${page}`} id={`${listId}-${page}`} listItems={listItems} offset={offset} /> : null}
    {isLoading ? <Loading key={`loader-${listId}-${page}`} /> : null}
  </TransitionGroup>
);

export default function ListComponent({
  isLoading,
  listId,
  listItems,
  offset,
  page,
  totalPages,
}) {
  return (
    <Wrapper>
      <Pagination listId={listId} current={page} total={totalPages} />
      <List listId={listId} page={page} isLoading={isLoading} listItems={listItems} offset={offset} />
    </Wrapper>
  );
}

ListComponent.propTypes = {
  listId: PropTypes.string.isRequired,
  listItems: PropTypes.arrayOf(PropTypes.number).isRequired,
  offset: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
};
