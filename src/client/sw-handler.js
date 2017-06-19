const CACHE = 'hn-pwa-api';

function fetchOrCache(fetch, cache) {
  return cache.then(
    cacheResponse =>
      !cacheResponse
        ? fetch
        : Promise.race([new Promise(res => setTimeout(res, 300)), fetch])
            .then(fetchResponse => fetchResponse || cacheResponse)
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
  const fetchPromise = fetch(evt.request);

  const {pathname} = new URL(evt.request.url);
  if (!pathname.startsWith('/api')) return evt.respondWith(fetchPromise);

  const fromCachePromise = fromCache(evt.request);

  evt.respondWith(
    fetchOrCache(fetchPromise.then(r => r.clone()), fromCachePromise)
  );

  return evt.waitUntil(
    fetchPromise
      .then(
        response =>
          response.status === 200 ? updateCache(evt.request, response) : null
      )
      .catch(e => {
        Function.prototype(e);
      })
  );
});
