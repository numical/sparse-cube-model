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
    rowName,
    scenarioName = "defaultScenario"
  }) {
    const { interval, scenarios } = this.meta;
    const { y } = this.lengths;
    const scenario = scenarios[scenarioName];
    if (!scenario) {
      throw new Error(`Unknown scenario '${scenarioName}'`);
    }
    if (!rowName) {
      throw new Error(`A row name is required`);
    }
    if (scenario.rows[rowName]) {
      throw new Error(
        `Scenario '${scenarioName}' already has row '${rowName}'`
      );
    }
    scenario.rows[rowName] = {
      index: y
    };
    const z = scenario.index;
    this.setValue(initialInterval, y, z, initialValue);
    for (let i = initialInterval + 1; i < interval.count; i++) {
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
