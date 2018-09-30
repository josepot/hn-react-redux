import {compose, inc, map, pick, prop, propEq, reduce} from 'ramda';
import data from './data.json';
import {delayedResponse} from '../utils';

let nextId = compose(
  inc,
  reduce((acc, id) => Math.max(acc, id), 0),
  map(prop('id'))
)(data);

export const addItem = (title, author, price) => {
  // eslint-disable-next-line no-plusplus
  const item = {id: nextId++, title, author, price};
  data.push(item);
  return delayedResponse(item);
};

export const getItem = id => delayedResponse(data.find(propEq('id', id)));

export const getItems = (start, count) => {
  const end = start + count;
  return delayedResponse(
    data
      .filter((item, idx) => idx >= start && idx < end)
      .map(pick(['id', 'title']))
  );
};
