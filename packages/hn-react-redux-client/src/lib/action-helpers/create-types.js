export default (base, types, nameSpace = process.env.PROJECT_NAME || 'App') => {
  const res = {};
  types.forEach(type => {
    res[type] = `${nameSpace}/${base}/${type}`;
  });
  return Object.freeze(res);
};
