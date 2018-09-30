import R from 'ramda';
import {all, call} from 'redux-saga/effects';

import * as sagas from 'modules/sagas';

const callAllSagas = R.pipe(R.filter(R.is(Function)), R.map(call), R.values);

export default function* root() {
  yield all(callAllSagas(sagas));
}
