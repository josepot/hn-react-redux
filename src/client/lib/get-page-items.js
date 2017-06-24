import {PAGE_SIZE} from 'config';

export default (items, page) => {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE;
  return items.slice(from, to);
};
