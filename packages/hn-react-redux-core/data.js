const flipCoin = (odds = 0.5) => Math.random() >= odds;

module.exports = data => {
  const getDescendants = rootId => {
    const item = data.items[rootId];
    return !item
      ? {}
      : (item.kids || [])
          .map(getDescendants)
          .reduce((res, obj) => Object.assign(res, obj), {[rootId]: item});
  };

  const shuffleList = listId => {
    const list = data.lists[listId];
    const len = list.length;

    for (let i = 0; i < len - 1; i++) {
      if (flipCoin(0.333)) continue;
      const lowId = list[i + 1];
      const highId = list[i];
      list[i + 1] = highId;
      list[i] = lowId;
      data.items[lowId].score = data.itesm[highId].score + 1;
    }

    return list;
  };

  return {getDescendants, shuffleList};
};
