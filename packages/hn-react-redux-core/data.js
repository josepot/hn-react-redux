module.exports = data => {
  const getDescendants = rootId => {
    const item = data.items[rootId];
    return !item
      ? {}
      : (item.kids || [])
          .map(getDescendants)
          .reduce((res, obj) => Object.assign(res, obj), {[rootId]: item});
  };

  return {getDescendants};
};
