import R from 'ramda';
import {END, eventChannel} from 'redux-saga';
import {MAX_API_TRIES} from 'config';

const delay = ms => val =>
  new Promise(resolve => setTimeout(() => resolve(val), ms));

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

let ws;
export const subscription = (path, transformation) =>
  eventChannel(emit => {
    const url = `/api/subscription${path}`;
    if (ws && ws.readyState < 2) {
      const sendUrl = () => ws.send(url);
      if (ws.readyState === 0) {
        ws.onopen = sendUrl;
      } else sendUrl();
    } else {
      ws = new WebSocket(`${wsProtocol}://${host}${url}`);
    }

    ws.onmessage = R.pipe(R.prop('data'), JSON.parse, transformation, emit);
    ws.onclose = () => emit(END);
    return Function.prototype;
  });
