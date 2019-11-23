const Dense3DArray = require("../data-structures/Dense3DArray");
const modelMetadata = require("./modelMetadata");
const modelFunctions = require("../serialization/modelFunctions");

const replacer = (key, value) => (key === "fn" ? value.key : value);
const reviver = (fnsRepo, key, value) => (key === "fn" ? fnsRepo[key] : value);

const { defaultScenario } = modelMetadata;
const defaultValue = 0;

function getRow(rowName, scenarioName) {
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
  static from(serialized, fnsRepo = modelFunctions) {
    const meta = JSON.parse(serialized, reviver.bind(null, fnsRepo));
    return new Model(meta);
  }

  meta;
  #getRow;

  constructor(meta = {}) {
    super({ defaultValue });
    this.meta = modelMetadata(meta);
    [
      "addRow",
      "updateRow",
      "deleteRow",
      "deleteRows",
      "row",
      "addScenario",
      "deleteScenario",
      "toString"
    ].forEach(method => (this[method] = this[method].bind(this)));
    this.#getRow = getRow.bind(this);
    /*
    const { scenarios } = this.meta;
    const rowCount = Object.values(scenarios).reduce(
      (max, scenario) => {
        const scenarioRowCount = Object.keys(scenario).length;
        return scenarioRowCount > max ? scenarioRowCount : max;
      },
      0
    );
    if (rowCount > 0) {

    }
     */
  }

  addRow({
    rowName,
    scenarioName = defaultScenario,
    startInterval = 0,
    endInterval = this.meta.intervals.count - 1,
    fn,
    fnArgs = {},
    constants = [],
    dependsOn
  }) {
    const { intervals, scenarios } = this.meta;
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
    if (fn && !fn.key) {
      throw new Error(`function '${fn.name}' must have a 'key' property.`);
    }
    if (dependsOn) {
      dependsOn.forEach(providerName => {
        const provider = scenario.rows[providerName];
        if (!provider) {
          throw new Error(`Depends on unknown row '${rowName}'`);
        } else {
          if (provider.dependents) {
            provider.dependents.push(rowName);
          } else {
            provider.dependents = [rowName];
          }
        }
      });
    }
    scenario.rows[rowName] = {
      index: y,
      fn,
      fnArgs,
      constants,
      name: rowName
    };

    const z = scenario.index;
    for (let x = startInterval; x <= endInterval; x++) {
      const value =
        constants[x] === undefined
          ? fn({ model: this, scenario, x, y, z, ...fnArgs })
          : constants[x];
      this.set(x, y, z, value);
    }
    // populate remaining columns if necessary
    if (endInterval < intervals.count - 1) {
      this.set(intervals.count - 1, y, z, defaultValue);
    }
  }

  updateRow({
    rowName,
    scenarioName = defaultScenario,
    fn,
    fnArgs = {},
    constants
  }) {
    const { intervals } = this.meta;
    const { row, scenario } = this.#getRow(rowName, scenarioName);
    if (fn && !fn.key) {
      throw new Error(`function '${fn.name}' must have a 'key' property.`);
    }
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
      row.fn = fn;
      row.fnArgs = fnArgs;
    }
    if (constants || fn) {
      const rowstoUpdate = [row];
      if (row.dependents) {
        rowstoUpdate.push(
          ...row.dependents.map(
            dependencyRowName =>
              this.#getRow(dependencyRowName, scenarioName).row
          )
        );
      }
      rowstoUpdate.forEach(row => {
        const y = row.index;
        const z = scenario.index;
        for (let x = startInterval; x < intervals.count; x++) {
          const value =
            row.constants[x] === undefined
              ? row.fn({ model: this, scenario, x, y, z, ...row.fnArgs })
              : row.constants[x];
          this.set(x, y, z, value);
        }
      });
    } else {
      throw new Error("No function or constants passed to update row.");
    }
  }

  deleteRow({ rowName, scenarioName = defaultScenario }) {
    const { row, scenario } = this.#getRow(rowName, scenarioName);
    const { x: lenX, z: lenZ } = this.lengths;
    if (row.dependents && row.dependents.length > 0) {
      throw new Error(
        `Cannot delete row '${rowName}' as rows '${row.dependents.join(
          ", "
        )}' depend on it.`
      );
    }
    delete scenario.rows[rowName];
    if (lenZ === 1) {
      this.delete({ y: row.index });
    } else {
      for (let x = 0; x < lenX; x++) {
        this.set(x, row.index, scenario.index, defaultValue);
      }
    }
  }

  deleteRows({ rowNames, scenarioName = defaultScenario }) {
    const { rows, scenario } = rowNames.reduce(
      ({ rows, scenario }, rowName) => {
        const { row: r, scenario: s } = this.#getRow(rowName, scenarioName);
        return { rows: [...rows, r], scenario: s };
      },
      { rows: [] }
    );
    // can delete all if they are dependent only on each other
    rows.forEach(row => {
      if (row.dependents && row.dependents.length > 0) {
        row.dependents.forEach(dependent => {
          if (!rowNames.includes(dependent)) {
            throw new Error(
              `Cannot delete row '${row.name}' as row '${dependent}' depends on it.`
            );
          }
        });
      }
    });
    // delete from largest index downwards
    rows
      .sort((r1, r2) => r2.index - r1.index)
      .forEach(row => {
        this.delete({ y: row.index });
        delete scenario.rows[row.name];
      });
  }

  row({ rowName, scenarioName = defaultScenario }) {
    const { row, scenario } = this.#getRow(rowName, scenarioName);
    return this.range({ y: row.index, z: scenario.index });
  }

  addScenario({ scenarioName, copyOf = defaultScenario } = {}) {
    const { scenarios } = this.meta;
    if (!scenarioName) {
      throw new Error("A scenario name is required.");
    }
    if (!scenarios[copyOf]) {
      throw new Error(`Unknown scenario '${copyOf}'`);
    }
    scenarios[scenarioName] = {
      index: this.lengths.z,
      rows: { ...scenarios[copyOf].rows }
    };
    if (!this.isEmpty()) {
      this.duplicate({ z: scenarios[copyOf].index });
    }
  }

  deleteScenario(scenarioName) {
    const { scenarios } = this.meta;
    if (!scenarioName) {
      throw new Error("A scenario name is required.");
    }
    const scenario = scenarios[scenarioName];
    if (!scenario) {
      throw new Error(`Unknown scenario '${scenarioName}'`);
    }
    if (Object.keys(scenarios).length === 1) {
      throw new Error(`Cannot delete only scenario '${scenarioName}'.`);
    }
    delete scenarios[scenarioName];
    this.delete({ z: scenario.index });
  }

  toString({ pretty = false } = {}) {
    const space = pretty ? 2 : 0;
    return JSON.stringify(this.meta, replacer, space);
  }
}

module.exports = Model;
