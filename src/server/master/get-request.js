const MAX_ONGOING_REQUESTS = 50;

const queuedRequests = {};
const queue = new Heap(
  (a, b) =>
    a.priority === b.priority ? a.queueId < b.queueId : a.priority > b.priority
);

let nIdle = MAX_ONGOING_REQUESTS;
let queueId = 1;

async function processNextRequestInQueue() {
  if (nIdle === 0) return null;
  if (queue.isEmpty()) return queue.trim();

  let request;
  do {
    request = queue.poll();
  } while (request.cancelled && !queue.isEmpty());
  if (request.cancelled) return queue.trim();

  nIdle--;
  try {
    const response = await fetch(request.url, {timeout: 2000});
    const data = await response.json();
    request.resolvers.forEach(([resolve]) => resolve(data));
    delete queuedRequests[request.id];
  } catch (e) {
    request.nTries++;
    // logger.warn('request failed, requeueing it', { request, error })
    if (request.nTries < 10) return queue.add(request);
    request.resolvers.forEach(([, reject]) => reject(e));
  } finally {
    nIdle++;
  }

  processNextRequestInQueue();
}

module.exports = (id, url, priority) => new Promise((res, rej) => {
  let resolvers = [[resolve, reject]];
  const competitor = queuedRequests[id];

  if (competitor) {
    competitor.resolvers.push(resolvers[0]);
    if (priority > competitor.priority) {
      competitor.cancelled = true;
      resolvers = competitor.resolvers;
    } else {
      return;
    }
  }

  const request = {
    id,
    url,
    priority,
    resolvers,
    nTries: 0,
    queueId: queueId++,
  };

  queuedRequests[id] = request;
  queue.add(request);
  processNextRequestInQueue();
});
