import combineDependantReducers from 'combine-dependant-reducers';
import R from 'ramda';
import rereducer from 'rereducer';
import {ACTIONS} from './actions';

const timestampsHOReducer = (oldItems, oldLists, oldUsers) =>
  rereducer(
    [
      ACTIONS.RESOURCES_RECEIVED,
      (state, {items = {}, users = {}, lists = {}, path, timestamp}) => {
        const getNewTimestamps = (newOnes, oldOnes, resourceType) =>
          R.keys(newOnes)
            .filter(id => !R.equals(newOnes[id], oldOnes[id]))
            .map(R.concat(resourceType))
            .reduce(
              (result, id) => Object.assign(result, {[id]: timestamp}),
              {}
            );

        return {
          ...state,
          ...getNewTimestamps(items, oldItems, 'items'),
          ...getNewTimestamps(lists, oldLists, 'lists'),
          ...getNewTimestamps(users, oldUsers, 'users'),
          [path]: timestamp,
        };
      },
    ],
    {}
  );

const getUpdatedOnes = (timestamps, action, resourceType) =>
  R.pipe(
    R.keys,
    R.filter(id => timestamps[`${resourceType}${id}`] === action.timestamp),
    R.pick(R.__, action[resourceType])
  )(action[resourceType]);

const getResourceHOReducer = resourceType => timestamps =>
  rereducer(
    [
      ACTIONS.RESOURCES_RECEIVED,
      (state, action) => ({
        ...state,
        ...getUpdatedOnes(timestamps, action, resourceType),
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
  items: ['@next timestamps', getResourceHOReducer('items')],
  lists: ['@next timestamps', getResourceHOReducer('lists')],
  users: ['@next timestamps', getResourceHOReducer('users')],
  ongoing: ongoingReducer,
});
