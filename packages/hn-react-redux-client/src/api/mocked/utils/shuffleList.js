const getRndm = max => Math.floor(Math.random() * max);

export default list => {
  const result = list.slice(0);
  const len = list.length;

  for (let i = 0; i < len; i += 1) {
    const [val] = result.splice(getRndm(len - i), 1);
    result.push(val);
  }

  return result;
};
