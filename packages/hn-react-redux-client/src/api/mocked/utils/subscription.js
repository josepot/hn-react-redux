import {compose} from 'ramda';
import {eventChannel} from 'redux-saga';

const UPDATE_RATE = 15000;

const update = (fn, options) => {
  if (!options.isRunning) return;

  // eslint-disable-next-line no-param-reassign
  options.cancelId = setTimeout(() => {
    fn();
    update(fn, options);
  }, Math.floor(Math.random() * UPDATE_RATE));
};

const getSubscription = (updater, onData) => {
  const options = {isRunning: true};
  update(
    compose(
      onData,
      updater
    ),
    options
  );
  return () => {
    options.isRunning = false;
    clearTimeout(options.cancelId);
  };
};

export default updater => eventChannel(emit => getSubscription(updater, emit));
