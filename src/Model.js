const Sparse3DArray = require('./Sparse3DArray');

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
    if (fn == null) {
      fn = z;
      z = Sparse3DArray.defaultZ;
    };
    if (typeof fn !== 'function') {
      throw new Error(`${fn} not a function`)
    };
    super.set(x, y, z, fn);
  }
};

module.exports = Model;
