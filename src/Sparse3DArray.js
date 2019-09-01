const { compose, curry } = require("ramda");

const getOrCreateArrayAtIndex = (parentArray, index) => {
  if (!parentArray[index]) {
    parentArray[index] = [];
  }
  return parentArray[index];
};

class Sparse3DArray {
  #data;

  constructor() {
    this.#data = [];
    this.element = this.element.bind(this);
  }

  element(pos, value) {
    if(pos == null) return undefined;
    if(pos.x == null) return undefined;
    if(pos.y == null) return undefined;
    const { x, y, z = 0 } = pos;
    const d = this.#data;
    if (value) {
      const dx = getOrCreateArrayAtIndex(d, x);
      const dy = getOrCreateArrayAtIndex(dx, y);
      const dz = getOrCreateArrayAtIndex(dy, z);
      dz[0] = value;
      return value;
    } else {
      return d[x] && d[x][y] && d[x][y][z] ? d[x][y][z][0] : undefined;
    }
  };
}

module.exports = Sparse3DArray;
