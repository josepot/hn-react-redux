import {map, pick, prop} from 'ramda';

export default validations => {
  const keys = Object.keys(validations);
  const fns = map(prop(0), validations);
  const messages = map(prop(1), validations);

  return values => {
    const erroredKeys = keys.filter(key => !fns[key](values[key]));
    return pick(erroredKeys, messages);
  };
};
