import createTypes from 'lib/create-types';

export const ACTIONS = createTypes('RESOURCES', [
  'RESOURCES_NEEDED',
  'RESOURCES_RECEIVED',
]);

export const onResourcesNeeded = path => ({
  type: ACTIONS.RESOURCES_NEEDED,
  path,
});
export const onResourcesReceived = (path, payload) => ({
  type: ACTIONS.RESOURCES_RECEIVED,
  path,
  ...payload,
});
