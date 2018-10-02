import {request} from './utils';

export const addItem = (title, author, price) =>
  request('/items', {title, author, price}, 'POST');

export const getItem = id => request(`/items/${id}`);

export const getItems = (offset, count) => request('/items', {offset, count});
