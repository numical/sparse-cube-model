const Sparse3DArray = require('./Sparse3DArray');
const identity = require('./fns/identity');

const { isArray } = Array;
const methods = ['get', 'set', 'unset'];

class Model {

  #constants;
  #fns;

  constructor() {
    methods.forEach(method => this[method] = this[method].bind(this));
    this.#constants = new Sparse3DArray();
    this.#fns = new Sparse3DArray();
  }

  get(x, y, z = 0) {
    const fn = this.#fns.get(x, y, z);
    return fn ? fn() : 0;
  }

  set(x, y, z, value) {
    if(!value) {
      value = z;
      z = 0;
    }
    if (isArray(x)) {
      x.forEach(e => this.set(e, y, z, value));
    } else if (isArray(y)) {
      y.forEach(e => this.set(x, e, z, value));
    } else if (isArray(z)) {
      z.forEach(e => this.set(x, y, e, value));
    } else {
      switch(typeof value) {
        case 'function':
          if (this.#constants.get(x, y, z) === undefined) {
            this.#fns.set(x, y, z, value);
            return true;
          }
          return false;
        case 'number':
          this.#constants.set(x, y, z, value);
          this.#fns.set(x, y, z, identity(value));
          return true;
        default:
          throw new Error(`'${value}' is not a function or a number`)
      }

    }
  }

  unset(x, y, z = if (isArray(x)) {
      x.forEach(e => this.unset(e, y, z));
    } else if (isArray(y)) {
      y.forEach(e => this.unset(x, e, z));
    } else if (isArray(z)) {
      z.forEach(e => this.unset(x, y, e));
    } else {
      this.#constants.unset(x, y, z);
      this.#fns.unset(x, y, z);
    }
  }
};

module.exports = Model;
