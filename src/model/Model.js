const R = require("ramda");

const Dense3DArray = require("../data-structures/Dense3DArray");
const Sparse3DArray = require("../data-structures/Sparse3DArray");
const modelDefaults = require("./modelDefaults");

class Model extends Dense3DArray {
  meta;
  #constants;

  constructor(meta = {}) {
    super({ defaultValue: 0 });
    this.meta = R.mergeDeepLeft(meta, modelDefaults());
    this.#constants = new Sparse3DArray();
    ["addRow", "setValue"].forEach(
      method => (this[method] = this[method].bind(this))
    );
  }

  addRow({
    initialValue,
    subsequentValues,
    initialInterval = 0,
    scenario = "defaultScenario"
  }) {
    const { interval, scenarios } = this.meta;
    const { y } = this.lengths;
    const z = scenarios[scenario];
    if (z === undefined) {
      throw new Error(`Unknown scenario '${scenario}'`);
    }
    this.setValue(initialInterval, y, z, initialValue);
    for (let i = initialInterval + 1; i < interval.number; i++) {
      this.setValue(i, y, z, subsequentValues);
    }
  }

  setValue(x, y, z, value) {
    switch (typeof value) {
      case "function":
        this.set(x, y, z, value(x, y, z));
        break;
      case "number":
        this.#constants.set(x, y, z, value);
        this.set(x, y, z, value);
        break;
      default:
        throw new Error(
          `Invalid type '${typeof value}' for model value '${value}'`
        );
    }
  }
}

module.exports = Model;
