const debug = require('debug')('sparse-cube-model:Sparse3DArray');
const methods = ['get', 'set', 'unset'];
const defaultZ = 0;

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
    methods.forEach(method => this[method] = this[method].bind(this));
  }

  get(x, y, z = defaultZ) {
    const d = this.#data;
    return d[x] && d[x][y] && d[x][y][z] ? d[x][y][z][0] : undefined;
  }

  set(x, y, z, value) {
    if (value == null) {
      value = z;
      z = defaultZ;
    }
    debug('set: %d,%d,%d:%o', x, y, z, value);
    const d = this.#data;
    const dx = getOrCreateArrayAtIndex(d, x);
    const dy = getOrCreateArrayAtIndex(dx, y);
    const dz = getOrCreateArrayAtIndex(dy, z);
    dz[0] = value;
    return value;
  }

  unset(x, y, z = defaultZ) {
    if (this.get(x, y, z) != null) {
      const d = this.#data;
      d[x][y][z] = [];
    }
  }
}

module.exports = Sparse3DArray;
