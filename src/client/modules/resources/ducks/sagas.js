import {
  all,
  call,
  cancelled,
  fork,
  select,
  take,
  takeEvery,
  takeLatest,
  put,
} from 'redux-saga/effects';
import {delay} from 'redux-saga';

import {UPDATE_FREQUENCY} from 'config';
import {apiFetch, sendToServiceWorker, subscription} from 'api';
import getNow from 'lib/get-now-unix-time';
import {LOCATION_CHANGED} from 'modules/router';
import {ACTIONS, onResourcesNeeded, onResourcesReceived} from './actions';
import {
  getAreResourcesEmpty,
  getIsOngoing,
  getLocationLatestUpdate,
  getLocationResources,
} from './selectors';

function* requestResourcesWhenNeeded() {
  const isOngoing = yield select(getIsOngoing);
  if (isOngoing) return;

  const latestUpdate = yield select(getLocationLatestUpdate);
  const now = yield call(getNow);

  const secsSinceLastUpdate = now - latestUpdate;
  if (!latestUpdate || secsSinceLastUpdate * 1000 >= UPDATE_FREQUENCY) {
    yield put(onResourcesNeeded());
  }
}

function* requestResources() {
  const locationResources = yield select(getLocationResources);
  if (!locationResources) return;
  const {path, transformation} = locationResources;
  const payload = yield call(apiFetch, path);
  yield put(onResourcesReceived(path, transformation(payload)));
}

function* handleLocationChange() {
  const resources = yield select(getLocationResources);
  if (!resources) return;

  const {path, transformation} = resources;

  let chan;
  yield call(requestResourcesWhenNeeded, path);
  try {
    chan = yield call(subscription, path, transformation);
    while (1) {
      const payload = yield take(chan);
      yield put(onResourcesReceived(path, payload));
    }
  } catch (e) {
    // Internet connection lost, no big deal
  } finally {
    if (yield cancelled()) {
      chan.close();
    } else {
      yield call(delay, UPDATE_FREQUENCY);
      yield call(handleLocationChange);
    }
  }
}

function* handleInit() {
  if (navigator.serviceWorker) {
    const areResourcesEmpty = yield select(getAreResourcesEmpty);

    if (!areResourcesEmpty) {
      // It's initial render after SSR
      const {path, getResponseFromInitialState} = yield select(
        getLocationResources
      );
      const data = yield select(getResponseFromInitialState);
      yield fork(sendToServiceWorker, `/api${path}`, data);
    }
  }
  yield put({type: 'INIT_RESOURCES'});
}

export default function* saga() {
  yield all([
    takeEvery(ACTIONS.RESOURCES_NEEDED, requestResources),
    takeLatest([LOCATION_CHANGED, 'INIT_RESOURCES'], handleLocationChange),
    call(handleInit),
  ]);
}
