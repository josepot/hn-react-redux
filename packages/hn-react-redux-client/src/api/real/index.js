import {END, eventChannel} from 'redux-saga';

const MAX_API_TRIES = 3;
const delay = ms => val =>
  new Promise(resolve => setTimeout(() => resolve(val), ms));

const apiFetch = (path, nTries = 1) =>
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

export const sendToServiceWorker = async (endpoint, data) => {
  const message = JSON.stringify({endpoint, data});
  if (!navigator.serviceWorker) return null;

  const {active} = await navigator.serviceWorker.ready;
  return active.postMessage(message);
};

let ws;
let onEnd;
const subscription = path => {
  const subscriptionUrl = `/api/subscription${path}`;

  return eventChannel(emit => {
    if (ws && ws.readyState < 2) {
      const sendUrl = () => ws.send(subscriptionUrl);
      if (ws.readyState === 0) {
        ws.onopen = sendUrl;
      } else sendUrl();
    } else {
      ws = new WebSocket(`${wsProtocol}://${host}${subscriptionUrl}`);
      onEnd = ws.close.bind(ws);
    }

    ws.onmessage = ({data: rawData}) => {
      const {resourceId, ...data} = JSON.parse(rawData);
      sendToServiceWorker(`/api${resourceId}`, data);
      emit(data);
    };
    ws.onclose = () => emit(END);
    return onEnd;
  });
};

const listCall = fn => (listId, page) => fn(`/list/${listId}/${page}`);
const discussionCall = fn => itemId => fn(`/discussion/${itemId}`);
const userCall = fn => userId => fn(`/user/${userId}`);

export const subscribeToList = listCall(subscription);
export const getList = listCall(apiFetch);

export const subscribeToDiscussion = discussionCall(subscription);
export const getDiscussion = discussionCall(apiFetch);

export const subscribeToUser = userCall(subscription);
export const getUser = userCall(apiFetch);
