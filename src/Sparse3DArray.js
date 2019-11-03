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
    ["get", "set", "unset"].forEach(
      method => (this[method] = this[method].bind(this))
    );
  }

  get(x, y, z) {
    const d = this.#data;
    return d[x] && d[x][y] && d[x][y][z] ? d[x][y][z][0] : undefined;
  }

  set(x, y, z, value) {
    const d = this.#data;
    const dx = getOrCreateArrayAtIndex(d, x);
    const dy = getOrCreateArrayAtIndex(dx, y);
    const dz = getOrCreateArrayAtIndex(dy, z);
    dz[0] = value;
    return value;
  }

  unset(x, y, z) {
    if (this.get(x, y, z) != null) {
      const d = this.#data;
      d[x][y][z] = [];
    }
  }
}

module.exports = Sparse3DArray;
