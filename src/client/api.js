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

export const sendToServiceWorker = (endpoint, data) => {
  if (navigator.serviceWorker) {
    navigator.serviceWorker.ready.then(({active}) =>
      active.postMessage(JSON.stringify({endpoint, data}))
    );
  }
};

let ws;
export const subscription = (path, transformation) => {
  const subscriptionUrl = `/api/subscription${path}`;
  const fetchUrl = `/api${path}`;

  return eventChannel(emit => {
    if (ws && ws.readyState < 2) {
      const sendUrl = () => ws.send(subscriptionUrl);
      if (ws.readyState === 0) {
        ws.onopen = sendUrl;
      } else sendUrl();
    } else {
      ws = new WebSocket(`${wsProtocol}://${host}${subscriptionUrl}`);
    }

    ws.onmessage = ({data: rawData}) => {
      const data = JSON.parse(rawData);
      sendToServiceWorker(fetchUrl, data);
      emit(transformation(data));
    };
    ws.onclose = () => emit(END);
    return Function.prototype;
  });
};
