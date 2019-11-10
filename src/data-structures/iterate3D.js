const iterate3D = (x, y, z, fn) => {
  if (fn === undefined && z === undefined && typeof y === "function") {
    fn = y;
    y = x;
    z = x;
  }
  for (let i = 0; i < x; i++) {
    for (let j = 0; j < y; j++) {
      for (let k = 0; k < z; k++) {
        fn(i, j, k);
      }
    }
  }
};

module.exports = iterate3D;
