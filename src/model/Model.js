const Dense3DArray = require("../data-structures/Dense3DArray");
const modelMetadata = require("./modelMetadata");

const defaultValue = 0;

class Model extends Dense3DArray {
  meta;

  constructor(meta = {}) {
    super({ defaultValue });
    this.meta = modelMetadata(meta);
    ["addRow"].forEach(method => (this[method] = this[method].bind(this)));
  }

  addRow({
    fn,
    constants = [],
    startInterval = 0,
    endInterval = this.meta.interval.count - 1,
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
    const boundFn = fn ? fn.bind(null, this) : undefined;
    scenario.rows[rowName] = {
      index: y,
      fn: boundFn,
      constants
    };
    const z = scenario.index;
    for (let i = startInterval; i <= endInterval; i++) {
      if (constants[i] === undefined) {
        this.set(i, y, z, boundFn(i, y, z));
      } else {
        this.set(i, y, z, constants[i]);
      }
    }
    // populate remaining columns if necessary
    if (endInterval < interval.count - 1) {
      this.set(interval.count - 1, y, z, defaultValue);
    }
  }
}

module.exports = Model;
