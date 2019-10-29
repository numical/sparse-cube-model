const Sparse3DArray = require('./Sparse3DArray');

const { isArray } = Array;
const methods = ['get', 'set'];

class Model extends Sparse3DArray {
  constructor() {
    super();
    methods.forEach(method => this[method] = this[method].bind(this));
  }

  get(x, y, z) {
    const fn = super.get(x, y, z);
    return fn ? fn() : 0;
  }

  set(x, y, z, fn) {
    if (!fn) {
      fn = z;
      z = Sparse3DArray.defaultZ;
    };
    if (typeof fn !== 'function') {
      throw new Error(`'${fn}' is not a function`)
    }
    if (isArray(x)) {
      x.forEach(e => this.set(e, y, z, fn));
    } else if (isArray(y)) {
      y.forEach(e => this.set(x, e, z, fn));
    } else if (isArray(z)) {
      z.forEach(e => this.set(x, y, e, fn));
    } else {
      super.set(x, y, z, fn);
    }
  }
};

module.exports = Model;
