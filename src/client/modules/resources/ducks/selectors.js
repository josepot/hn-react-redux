import R from 'ramda';
import {createSelector} from 'reselect';
import {LISTS, PAGE_SIZE} from 'config';
import {getLocationPath} from 'modules/router';

const getResources = R.prop('resources');

export const getLists = createSelector(getResources, R.prop('lists'));
export const getItems = createSelector(getResources, R.prop('items'));
export const getUsers = createSelector(getResources, R.prop('users'));
export const getTimestamps = createSelector(getResources, R.prop('timestamps'));
export const getOngoing = createSelector(getResources, R.prop('ongoing'));

export const getAreResourcesEmpty = createSelector(getTimestamps, R.isEmpty);

const defaultTransformation = ({items = {}, lists = {}, users = {}}) => ({
  items,
  lists,
  users,
});

const listTransformation = listId => res =>
  res ? {lists: {[listId]: res.list}, items: res.items} : {};
const userTransformation = res =>
  res ? {users: {[res.user.id]: res.user}} : {};
const itemTransformation = res => res || {};

export const getLocationResources = createSelector([getLocationPath], path => {
  const parts = path.split('/').slice(1);
  if (parts.length > 2) return null;
  if (parts[0] === 'item') {
    return parts[1]
      ? {
          path: `/discussion/${parts[1]}`,
          transformation: R.pipe(itemTransformation, defaultTransformation),
          getResponseFromInitialState: ({resources}) =>
            R.pick(['items'], resources),
        }
      : null;
  }
  if (parts[0] === 'user') {
    return parts[1]
      ? {
          path: `/users/${parts[1]}`,
          transformation: R.pipe(userTransformation, defaultTransformation),
          getResponseFromInitialState: ({resources}) => ({
            user: resources.users[parts[1]],
          }),
        }
      : null;
  }
  const id = LISTS[parts[0].toLowerCase()];
  if (!id) return null;

  const page = parseInt(parts[1] || '1', 10);
  return !isNaN(page)
    ? {
        path: `/list/${id}/${page}`,
        transformation: R.pipe(listTransformation(id), defaultTransformation),
        getResponseFromInitialState: ({resources}) => ({
          list: resources.lists[id],
          items: resources.items,
        }),
      }
    : null;
});

export const getLocationFormalPath = createSelector(
  [getLocationResources],
  resources => resources && resources.path
);

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
  createSelector(getLists, R.prop(listId))
);

export const getListPageFactory = R.memoize((listId, page) =>
  createSelector(
    [getListsFactory(listId), isLoadingFactory(`/list/${listId}/${page}`)],
    (list, isLoading) => {
      if (!R.is(Array, list))
        return {listItems: null, totalPages: 0, isLoading};

      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE;
      const listItems = list.slice(from, to);

      return {
        listItems,
        totalPages: Math.ceil(list.length / PAGE_SIZE),
        isLoading,
      };
    }
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
