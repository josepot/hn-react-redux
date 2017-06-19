import {createStore} from 'redux';
import {connectRouter} from 'connected-react-router';

import {getLocationFormalPath} from 'modules/resources/ducks/selectors';
import {onResourcesReceived} from 'modules/resources/ducks/actions';

export default (reducer, history, data) => {
  const enhancedReducer = connectRouter(history)(reducer);
  const store = createStore(enhancedReducer);

  const path = getLocationFormalPath(store.getState());
  store.dispatch(onResourcesReceived(path, data));

  return store;
};
