const Heap = require('fastpriorityqueue');
const fetch = require('node-fetch');

const MAX_ONGOING_REQUESTS = 50;

const queuedRequests = {};
const queue = new Heap(
  (a, b) =>
    a.priority === b.priority ? a.queueId < b.queueId : a.priority > b.priority
);

let nIdle = MAX_ONGOING_REQUESTS;

async function processNextRequestInQueue() {
  if (nIdle === 0) return null;
  if (queue.isEmpty()) return queue.trim();

  let request;
  do {
    request = queue.poll();
  } while (request.cancelled && !queue.isEmpty());
  if (request.cancelled) return queue.trim();

  nIdle -= 1;
  try {
    const response = await fetch(request.url, {timeout: 2000});
    const data = await response.json();
    request.resolvers.forEach(([resolve]) => resolve(data));
    delete queuedRequests[request.id];
  } catch (e) {
    request.nTries += 1;
    if (request.nTries < 10) return queue.add(request);
    request.resolvers.forEach(([, reject]) => reject(e));
  } finally {
    nIdle += 1;
    processNextRequestInQueue();
  }
  return null;
}

let queueId = 1;
const getRequest = (id, url, priority) =>
  new Promise((res, rej) => {
    let resolvers = [[res, rej]];
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
    queueId += 1;

    const request = {
      id,
      url,
      priority,
      resolvers,
      nTries: 0,
      queueId,
    };

    queuedRequests[id] = request;
    queue.add(request);
    processNextRequestInQueue();
  });

const healthCheck = logger => {
  const nQueuedRequests = Object.keys(queuedRequests).length;
  logger.info(`Health Check: There are ${nQueuedRequests} queued requests`);
  logger.info(`Health Check: Is the queue empty? ${queue.isEmpty()}`);
  logger.info(`Health Check: There are ${nIdle} threats iddle`);
};

module.exports = {getRequest, healthCheck};
