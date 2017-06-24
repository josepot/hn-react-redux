import R from 'ramda';
import {createSelector} from 'reselect';
import {LISTS, PAGE_SIZE} from 'config';
import {getLocationPath} from 'modules/router';

const getResources = R.prop('resources');

export const getLists = createSelector(getResources, R.prop('lists'));
export const getItems = createSelector(getResources, R.prop('items'));
export const getUsers = createSelector(getResources, R.prop('users'));
export const getListPages = createSelector(getResources, R.prop('listPages'));
export const getTimestamps = createSelector(getResources, R.prop('timestamps'));
export const getOngoing = createSelector(getResources, R.prop('ongoing'));

export const getAreResourcesEmpty = createSelector(getTimestamps, R.isEmpty);

export const getLocationFormalPath = createSelector([getLocationPath], path => {
  const parts = path.split('/').slice(1);
  if (parts.length > 2) return null;
  if (parts[0] === 'item') {
    return parts[1] ? `/discussion/${parts[1]}` : null;
  }
  if (parts[0] === 'user') {
    return parts[1] ? `/user/${parts[1]}` : null;
  }
  const id = LISTS[parts[0].toLowerCase()];
  if (!id) return null;

  const page = parseInt(parts[1] || '1', 10);
  return !isNaN(page) ? `/list/${id}/${page}` : null;
});

export const getLocationLatestUpdate = createSelector(
  [getTimestamps, getLocationFormalPath],
  (timestamps, path) => path && timestamps[path]
);

const isLoadingFactory = R.memoize(path =>
  createSelector(
    [getOngoing, getTimestamps],
    (ongoing, timestamps) => ongoing[path] || timestamps[path] === undefined
  )
);

const getListsFactory = R.memoize(listId =>
  createSelector(getLists, R.propOr([], listId))
);

export const getListTotalPagesFactory = R.memoize(listId =>
  createSelector([getListsFactory(listId)], list =>
    Math.ceil(list.length / PAGE_SIZE)
  )
);

const getListPageFactory = R.memoize((listId, page) =>
  createSelector(getListPages, R.propOr(null, `/list/${listId}/${page}`))
);

export const getListPageItemsFactory = R.memoize((listId, page) =>
  createSelector(
    [
      getListPageFactory(listId, page),
      isLoadingFactory(`/list/${listId}/${page}`),
    ],
    (listItems, isLoading) => ({listItems, isLoading})
  )
);

export const getItemFactory = R.memoize(itemId =>
  createSelector([getItems], R.propOr(null, itemId))
);

export const getItemLoadingFactory = R.memoize(itemId =>
  createSelector(
    [getItemFactory(itemId), isLoadingFactory(`/items/${itemId}`)],
    (item, isLoading) => ({item, isLoading})
  )
);

export const getUserFactory = R.memoize(userId =>
  createSelector([getUsers], R.propOr(null, userId))
);

export const getIsOngoing = createSelector(
  [getOngoing, getLocationFormalPath],
  R.propOr(false)
);
