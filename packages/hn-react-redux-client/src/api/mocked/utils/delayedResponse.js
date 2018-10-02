const MAX_DELAY = 2000;

const delayData = (ms, data) =>
  new Promise(resolve => setTimeout(() => resolve(data), ms));

const getRandomDelay = () => 200 + Math.floor(Math.random() * MAX_DELAY);

export default data => delayData(getRandomDelay(), data);
