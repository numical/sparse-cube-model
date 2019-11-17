const iterate2D = (x, y, fn) => {
  for (let i = 0; i < x; i++) {
    for (let j = 0; j < y; j++) {
      fn(i, j);
    }
  }
};

module.exports = iterate2D;
