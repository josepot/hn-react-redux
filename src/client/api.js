import R from 'ramda';
import {END, eventChannel} from 'redux-saga';
import {MAX_API_TRIES} from 'config';

const delay = ms => val => new Promise(resolve => setTimeout(() => resolve(val), ms));

export const apiFetch = (path, nTries = 1) =>
  fetch(`/api${path}`)
    .then(response => {
      switch (response.status) {
        case 404:
          return {};
        case 200:
          return response.json();
        default:
          throw new Error(`Something unexpected happened, ${response.status}`);
      }
    })
    .catch(
      () =>
        nTries === MAX_API_TRIES
          ? null
          : delay(500 * 2 ** (nTries - 1))().then(() =>
              apiFetch(path, nTries + 1)
            )
    );

const {protocol, host} = window.location;
const wsProtocol = protocol === 'https:' ? 'wss' : 'ws';

export const subscription = (path, transformation) =>
  eventChannel(emit => {
    const ws = new WebSocket(`${wsProtocol}://${host}/api/subscription${path}`);

    ws.onmessage = R.pipe(R.prop('data'), JSON.parse, transformation, emit);
    ws.onclose = () => emit(END);
    return () => ws.close();
  });
