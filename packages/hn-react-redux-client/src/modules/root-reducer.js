import {combineReducers} from 'redux';

import items from './items';
import router from './router';

export default combineReducers({
  items,
  router,
});
