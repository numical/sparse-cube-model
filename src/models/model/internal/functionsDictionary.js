const lookupFns = require("../../../fns/lookupFunctions");
const interestFns = require("../../../fns/interestFunctions");

const allFns = { ...lookupFns, ...interestFns };

class FunctionsDictionary {
  constructor() {
    this.add = this.add.bind(this);
  }

  add(fn) {
    if (!fn) {
      throw new Error("Function required.");
    }
    if (typeof fn !== "function") {
      throw new Error(`'${fn}' is not a function.`);
    }
    if (!fn.key) {
      throw new Error(
        `Function '${fn.name}' requires a unique 'key' property.`
      );
    }
    if (this[fn.key]) {
      throw new Error(`Function key '${fn.key}' already exists.`);
    }
    this[fn.key] = fn;
  }
}

const singleton = new FunctionsDictionary();
Object.keys(allFns).forEach(key => singleton.add(allFns[key]));

module.exports = singleton;
