import {compose} from 'ramda';
import * as dataApi from './data';

import {delayedResponse, subscription} from './utils';

const delayedFn = fn =>
  compose(
    delayedResponse,
    fn
  );

export const [getList, getDiscussion, getUser] = [
  dataApi.getList,
  dataApi.getDiscussion,
  dataApi.getUser,
].map(delayedFn);

const toSubscription = fn =>
  function getSubscription() {
    // eslint-disable-next-line prefer-rest-params
    return subscription(Function.apply.bind(fn, null, arguments));
  };

export const [subscribeToList, subscribeToDiscussion, subscribeToUser] = [
  dataApi.getShuffledList,
  dataApi.getRndmDiscussion,
  dataApi.getUpdatedUser,
].map(toSubscription);
