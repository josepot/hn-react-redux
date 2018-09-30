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
import {delay, END, eventChannel} from 'redux-saga';

import {UPDATE_FREQUENCY} from 'config';
import {apiFetch, sendToServiceWorker, subscription} from 'api';
import getNow from 'lib/get-now-unix-time';
import {LOCATION_CHANGED} from 'modules/router';
import {ACTIONS, onResourcesNeeded, onResourcesReceived} from './actions';
import {
  getAreResourcesEmpty,
  getIsOngoing,
  getLocationLatestUpdate,
  getLocationFormalPath,
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
  const path = yield select(getLocationFormalPath);
  if (!path) return;
  const payload = yield call(apiFetch, path);
  yield put(onResourcesReceived(path, payload));
}

const getActiveSw = () =>
  navigator.serviceWorker.ready.then(() => navigator.serviceWorker);

const createSwListenerChannel = sw =>
  eventChannel(emit => {
    function onMessage({data}) {
      emit(JSON.parse(data));
    }
    function onStateChange({target: {state}}) {
      if (state === 'redundant') emit(END);
    }
    sw.addEventListener('message', onMessage);
    sw.addEventListener('statechange', onStateChange);

    return () => {
      sw.removeEventListener('message', onMessage);
      sw.removeEventListener('statechange', onStateChange);
    };
  });

function* getUpdatesFromSw() {
  if (!navigator.serviceWorker) return;

  const sw = yield call(getActiveSw);
  const chan = yield call(createSwListenerChannel, sw);
  try {
    while (1) {
      const {path, ...payload} = yield take(chan);
      yield put(onResourcesReceived(path, payload));
    }
  } finally {
    if (yield cancelled()) {
      chan.close();
    } else {
      yield fork(getUpdatesFromSw);
    }
  }
}

function* handleLocationChange() {
  const path = yield select(getLocationFormalPath);
  if (!path) return;

  let chan;
  yield call(requestResourcesWhenNeeded);
  try {
    chan = yield call(subscription, path);
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
      const path = yield select(getLocationFormalPath);
      const data = yield select(
        ({resources: {items, users, lists, timestamps}}) => ({
          timestamp: timestamps[path],
          items,
          users,
          lists,
        })
      );
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
    call(getUpdatesFromSw),
  ]);
}
