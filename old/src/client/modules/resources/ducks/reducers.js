import combineDependantReducers from 'combine-dependant-reducers';
import R from 'ramda';
import rereducer from 'rereducer';
import getPageItems from 'lib/get-page-items';
import {ACTIONS} from './actions';

const timestampsHOReducer = (oldItems, oldLists, oldUsers) =>
  rereducer(
    [
      ACTIONS.RESOURCES_RECEIVED,
      (timestamps, {items = {}, users = {}, lists = {}, path, timestamp}) => {
        if (timestamp <= timestamps[path]) return timestamps;

        const getNewTimestamps = (newOnes, oldOnes, resourceType) =>
          R.keys(newOnes)
            .filter(id => !R.equals(newOnes[id], oldOnes[id]))
            .map(R.concat(resourceType))
            .reduce(
              (result, id) => Object.assign(result, {[id]: timestamp}),
              {}
            );

        return {
          ...timestamps,
          ...getNewTimestamps(items, oldItems, 'items'),
          ...getNewTimestamps(lists, oldLists, 'lists'),
          ...getNewTimestamps(users, oldUsers, 'users'),
          [path]: timestamp,
        };
      },
    ],
    {}
  );

const listPagesHOReducer = (prevTimestamps, newTimestamps) =>
  rereducer(
    [
      ACTIONS.RESOURCES_RECEIVED,
      (listPages = {}, {path, lists}) => {
        if (
          path.substr(0, 5) !== '/list' ||
          newTimestamps[path] === prevTimestamps[path]
        )
          return listPages;
        const [listId, pageStr] = path.split('/').slice(2);
        return {
          ...listPages,
          [path]: getPageItems(lists[listId], parseInt(pageStr, 10)),
        };
      },
    ],
    {}
  );

const getUpdatedOnes = (prevTs, newTs, action, resourceType) =>
  R.pipe(
    R.keys,
    R.filter(key => {
      const id = `${resourceType}${key}`;
      return newTs[id] !== prevTs[id];
    }),
    R.pick(R.__, action[resourceType])
  )(action[resourceType]);

const getResourceHOReducer = resourceType => (prevTimestamps, newTimestamps) =>
  rereducer(
    [
      ACTIONS.RESOURCES_RECEIVED,
      (state, action) => ({
        ...state,
        ...getUpdatedOnes(prevTimestamps, newTimestamps, action, resourceType),
      }),
    ],
    {}
  );

const ongoingReducer = rereducer(
  [ACTIONS.RESOURCES_NEEDED, (state, {path}) => R.assoc(path, true, state)],
  [ACTIONS.RESOURCES_RECEIVED, (state, {path}) => R.dissoc(path, state)],
  {}
);

export default combineDependantReducers({
  timestamps: [
    '@prev items',
    '@prev lists',
    '@prev users',
    timestampsHOReducer,
  ],
  items: ['@both timestamps', getResourceHOReducer('items')],
  lists: ['@both timestamps', getResourceHOReducer('lists')],
  users: ['@both timestamps', getResourceHOReducer('users')],
  listPages: ['@both timestamps', listPagesHOReducer],
  ongoing: ongoingReducer,
});
