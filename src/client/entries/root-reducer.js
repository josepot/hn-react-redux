import R from 'ramda';
import {combineReducers} from 'redux';

import * as reducers from 'modules/reducers';

export default R.pipe(R.filter(R.is(Function)), combineReducers)(reducers);
