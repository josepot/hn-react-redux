const ACTIONS = createTypes('API', [
  'REQUEST_LIST',
  'LIST_RECEIVED'
]);

const onlistReceived = (listId, page, items) => ({
  type: ACTIONS.LIST_RECEIVED,
  payload: {listId, listOrder, items},
});

