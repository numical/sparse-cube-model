const Dense3DArray = require("../data-structures/Dense3DArray");
const modelMetadata = require("./modelMetadata");

const defaultScenario = "defaultScenario";
const defaultValue = 0;

function getRow({ rowName, scenarioName }) {
  const { scenarios } = this.meta;
  const scenario = scenarios[scenarioName];
  if (!scenario) {
    throw new Error(`Unknown scenario '${scenarioName}'`);
  }
  const row = scenario.rows[rowName];
  if (!row) {
    throw new Error(`Unknown row '${rowName}' for '${scenarioName}'`);
  }
  return { row, scenario };
}

class Model extends Dense3DArray {
  meta;
  #getRow;

  constructor(meta = {}) {
    super({ defaultValue });
    this.meta = modelMetadata(meta);
    ["addRow", "row", "updateRow"].forEach(
      method => (this[method] = this[method].bind(this))
    );
    this.#getRow = getRow.bind(this);
  }

  addRow({
    rowName,
    scenarioName = defaultScenario,
    startInterval = 0,
    endInterval = this.meta.interval.count - 1,
    fn,
    constants = [],
    dependsOn
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
    if (dependsOn) {
      dependsOn.forEach(providerName => {
        const provider = scenario.rows[providerName];
        if (!provider) {
          throw new Error(`Depends on unknown row '${rowName}'`);
        } else {
          if (provider.dependencies) {
            provider.dependencies.push(rowName);
          } else {
            provider.dependencies = [rowName];
          }
        }
      });
    }
    const boundFn = fn ? fn(this, scenario) : undefined;
    scenario.rows[rowName] = {
      index: y,
      fn: boundFn,
      constants
    };

    const z = scenario.index;
    for (let x = startInterval; x <= endInterval; x++) {
      const value =
        constants[x] === undefined ? boundFn(x, y, z) : constants[x];
      this.set(x, y, z, value);
    }
    // populate remaining columns if necessary
    if (endInterval < interval.count - 1) {
      this.set(interval.count - 1, y, z, defaultValue);
    }
  }

  updateRow({ rowName, scenarioName = defaultScenario, fn, constants }) {
    const { interval } = this.meta;
    const { row, scenario } = this.#getRow({ rowName, scenarioName });
    let startInterval = 0;
    if (constants) {
      startInterval = constants.reduce(
        (min, value, index) =>
          value !== undefined ? (index < min ? index : min) : min,
        constants.length
      );
      row.constants = [...constants];
    }
    if (fn) {
      startInterval = 0;
      row.fn = fn(this);
    }
    if (constants || fn) {
      const rowstoUpdate = [row];
      if (row.dependencies) {
        rowstoUpdate.push(
          ...row.dependencies.map(
            dependencyName =>
              this.#getRow({ rowName: dependencyName, scenarioName }).row
          )
        );
      }
      rowstoUpdate.forEach(row => {
        const y = row.index;
        const z = scenario.index;
        for (let x = startInterval; x < interval.count; x++) {
          const value =
            row.constants[x] === undefined ? row.fn(x, y, z) : row.constants[x];
          this.set(x, y, z, value);
        }
      });
    } else {
      throw new Error("No function or constants passed to update row.");
    }
  }

  row({ rowName, scenarioName = defaultScenario }) {
    const { row, scenario } = this.#getRow({ rowName, scenarioName });
    return this.range({ y: row.index, z: scenario.index });
  }
}

module.exports = Model;
