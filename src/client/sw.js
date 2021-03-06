const assets = []; // The plugin will replace this line with the correct assets
const CACHE = 'hn-pwa-api-v2';

const resources = ['/shell'];
// INSTALL
self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then(cache => cache.addAll(resources.concat(assets)))
      .then(() => self.skipWaiting())
  );
});

// ACTIVATE
self.addEventListener('activate', event =>
  event.waitUntil(() => self.clients.claim())
);

function fetchOrCache(originalFetch, cache, postToClient) {
  const fetch = originalFetch.then(r => r.clone());
  return cache.then(
    cacheResponse =>
      !cacheResponse
        ? fetch
        : Promise.race([new Promise(res => setTimeout(res, 300)), fetch])
            .then(fetchResponse => {
              if (!fetchResponse) {
                fetch.then(res => res.status === 200 && postToClient(res));
                return cacheResponse;
              }
              return fetchResponse;
            })
            .catch(() => cacheResponse)
  );
}

function fromCache(request) {
  return caches.open(CACHE).then(cache => cache.match(request));
}

function updateCache(request, response) {
  return caches.open(CACHE).then(cache => cache.put(request, response));
}

self.addEventListener('fetch', evt => {
  let finalPromise;
  let response;
  const {pathname} = new URL(evt.request.url);

  if (pathname.endsWith('.js') || pathname.endsWith('.json')) {
    response = fromCache(evt.request).then(cResponse => {
      if (cResponse) return cResponse;
      finalPromise = fetch(evt.request);
      return finalPromise;
    });
  } else if (pathname.startsWith('/api')) {
    finalPromise = fetch(evt.request);

    const postToClient = res =>
      Promise.all([
        self.clients.get(evt.clientId),
        res.json(),
      ]).then(([client, data]) =>
        client.postMessage(
          JSON.stringify(Object.assign(data, {path: pathname.substr(4)}))
        )
      );
    response = fetchOrCache(finalPromise, fromCache(evt.request), postToClient);
  } else {
    response = fromCache('/shell');
  }

  evt.respondWith(response);

  return (
    finalPromise &&
    evt.waitUntil(
      finalPromise
        .then(
          res => (res.status === 200 ? updateCache(evt.request, res) : null)
        )
        .catch(e => {
          Function.prototype(e);
        })
    )
  );
});

function handleClientMessage(event) {
  const {endpoint, data} = JSON.parse(event.data);
  const request = new Request(endpoint);
  const response = new Response(
    new Blob([JSON.stringify(data)], {type: 'application/json'})
  );
  event.waitUntil(updateCache(request, response));
}

self.addEventListener('message', handleClientMessage);
