const R = require("ramda");

const Dense3DArray = require("./Dense3DArray");
const Sparse3DArray = require("./Sparse3DArray");
const modelDefaults = require("./modelDefaults");

class Model {
  meta;
  #constants;
  #values;

  constructor(meta = {}) {
    this.meta = R.mergeDeepLeft(meta, modelDefaults());
    this.#constants = new Sparse3DArray();
    this.#values = new Dense3DArray({ defaultValue: 0 });
    [].forEach(method => (this[method] = this[method].bind(this)));
  }

  addRow({
    initialValue,
    subsequentValues,
    initialInterval = 0,
    scenario = "defaultScenario"
  }) {
    const { x, y } = this.#values.lengths;
    if (initialInterval >= x) {
      throw new Error(
        `Invalid initial interval ${initialInterval}: max interval: ${x - 1}`
      );
    }
    const z = this.meta.scenarios[scenario];
    setValue(initialInterval, y, z, initialValue);
    for (let i = initialInterval + 1; i < x; i++) {
      setValue(i, y, z, subsequentValues);
    }
  }

  setValue(x, y, z, value) {
    switch (typeof value) {
      case "function":
        this.#values.set(x, y, z, value(x, y, z));
        break;
      case "number":
        this.#constants.set(x, y, z, value);
        this.#values.set(x, y, z, value);
        break;
      default:
        throw new Error(
          `Invalid type ${typeof value} for model value ${value}`
        );
    }
  }
}

module.exports = Model;
