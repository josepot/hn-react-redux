export default (base, types, nameSpace = 'App') => {
  const res = {};
  types.forEach(type => {
    res[type] = `${nameSpace}/${base}/${type}`;
  });
  return Object.freeze(res);
};
