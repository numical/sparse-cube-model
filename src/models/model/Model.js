const Dense3DArray = require("../../data-structures/Dense3DArray");
const modelMetadata = require("./internal/modelMetadata");
const prepareRowConstants = require("./internal/prepareRowConstants");
const calculateRow = require("./internal/calculateRow");
const bindFnToRow = require("./internal/bindFnToRow");
const editRow = require("./internal/editRow");
const compareByIndex = require("./internal/compareByIndex");
const deleteSingleRow = require("./internal/deleteSingleRow");
const linkAllDependentRows = require("./internal/linkAllDependentRows");
const linkDependentRows = require("./internal/linkDependentRows");
const { validateConstants } = require("./internal/validateConstants");
const validateFn = require("./internal/validateFn");
const validateFnArgs = require("./internal/validateFnArgs");
const validateRow = require("./internal/validateRow");
const validateScenario = require("./internal/validateScenario");
const serializer = require("./internal/serializer");
const defaultValue = require("./internal/defaultValue");

const { defaultScenario } = modelMetadata;

class Model extends Dense3DArray {
  static parse(serialized, fnsRepo) {
    const meta = serializer.parse(serialized, fnsRepo);
    return new Model(meta);
  }

  #meta;

  constructor(meta = {}) {
    super({ defaultValue });
    this.#meta = modelMetadata(meta);
    linkAllDependentRows(this.#meta.scenarios);
    this.recalculate();
  }

  addRow({
    rowName,
    scenarioName = defaultScenario,
    fn,
    fnArgs,
    start,
    end,
    constants,
    dependsOn
  }) {
    const { intervals, scenarios } = this.#meta;
    const { y } = this.lengths;
    const scenario = validateScenario({ scenarioName, scenarios });
    validateRow({ rowName, scenario, shouldExist: false });
    validateFn({ fn, constants });
    validateFnArgs({ fn, fnArgs });
    validateConstants({ fn, constants });
    const { rowConstants } = prepareRowConstants({
      fn,
      constants,
      start,
      end,
      intervals
    });
    linkDependentRows(scenario, rowName, dependsOn);
    const row = {
      name: rowName,
      index: y,
      constants: rowConstants
    };
    bindFnToRow(
      this,
      this.#meta.intervals,
      scenario,
      row,
      fn,
      fnArgs,
      dependsOn
    );
    scenario.rows[rowName] = row;
    calculateRow(row, scenario, 0, intervals.count - 1, this.set);
  }

  updateRow({
    rowName,
    scenarioName = defaultScenario,
    fn,
    fnArgs,
    constants,
    dependsOn
  }) {
    const { intervals, scenarios } = this.#meta;
    const scenario = validateScenario({ scenarioName, scenarios });
    const row = validateRow({ rowName, scenario });
    validateFn({ fn, constants });
    validateFnArgs({ fn, fnArgs });
    validateConstants({ fn, constants });
    return editRow({
      model: this,
      row,
      scenario,
      intervals,
      fn,
      fnArgs,
      constants,
      existingConstants: undefined,
      dependsOn
    });
  }

  patchRow({
    rowName,
    scenarioName = defaultScenario,
    fn,
    fnArgs,
    constants,
    dependsOn
  }) {
    const { intervals, scenarios } = this.#meta;
    const scenario = validateScenario({ scenarioName, scenarios });
    const row = validateRow({ rowName, scenario });
    validateFn({ fn, constants });
    validateFnArgs({ fn: fn || row.fn, fnArgs });
    validateConstants({
      fn: fn || row.fn,
      constants: constants || row.constants
    });
    return editRow({
      model: this,
      row,
      scenario,
      intervals,
      fn: fn || row.fn,
      fnArgs: fnArgs || row.fnArgs,
      constants: constants,
      existingConstants: row.constants,
      dependsOn: dependsOn || row.dependsOn
    });
  }

  deleteRow({ rowName, scenarioName = defaultScenario }) {
    const { scenarios } = this.#meta;
    const scenario = validateScenario({ scenarioName, scenarios });
    const row = validateRow({ rowName, scenario });
    if (row.dependents) {
      throw new Error(
        `Cannot delete row '${rowName}' as rows '${row.dependents.join(
          ", "
        )}' depend on it.`
      );
    }
    deleteSingleRow(this, scenario, row, rowName);
    return row;
  }

  deleteRows({ rowNames, scenarioName = defaultScenario }) {
    const { scenarios } = this.#meta;
    const scenario = validateScenario({ scenarioName, scenarios });
    const rows = rowNames.map(rowName => validateRow({ rowName, scenario }));
    // can delete all if they are dependent only on each other
    rows.forEach(row => {
      if (row.dependents) {
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
        deleteSingleRow(this, scenario, row, row.name);
      });
    return rows.reverse();
  }

  row({ rowName, scenarioName = defaultScenario }) {
    const { scenarios } = this.#meta;
    const scenario = validateScenario({ scenarioName, scenarios });
    const row = validateRow({ rowName, scenario });
    return this.range({ y: row.index, z: scenario.index });
  }

  scenario({ scenarioName = defaultScenario } = {}) {
    const { scenarios } = this.#meta;
    const scenario = validateScenario({ scenarioName, scenarios });
    return this.isEmpty() ? [] : this.range({ z: scenario.index });
  }

  addScenario({ scenarioName, copyOf = defaultScenario } = {}) {
    const { scenarios } = this.#meta;
    validateScenario({ scenarioName, scenarios, shouldExist: false });
    const scenarioToCopy =
      typeof copyOf === "string" ? scenarios[copyOf] : copyOf;
    if (!scenarioToCopy) {
      throw new Error(`Unknown scenario '${copyOf}'`);
    }
    const copiedRows = Object.entries(scenarioToCopy.rows).reduce(
      (copy, [rowName, row]) => {
        copy[rowName] = {
          ...row,
          fn: row.fn.unbound
        };
        return copy;
      },
      {}
    );
    scenarios[scenarioName] = {
      index: this.isEmpty() ? 1 : this.lengths.z,
      rows: copiedRows
    };
    this.recalculate({ scenarioName });
  }

  deleteScenario({ scenarioName } = {}) {
    const { scenarios } = this.#meta;
    const scenario = validateScenario({ scenarioName, scenarios });
    if (Object.keys(scenarios).length === 1) {
      throw new Error(`Cannot delete only scenario '${scenarioName}'.`);
    }
    delete scenarios[scenarioName];
    if (!this.isEmpty()) {
      this.delete({ z: scenario.index });
    }
    return scenario;
  }

  recalculate({ scenarioName } = {}) {
    // compareByIndex a good proxy for dependencies
    const { intervals, scenarios } = this.#meta;
    const toRecalc = scenarioName ? [scenarios[scenarioName]] : scenarios;
    Object.values(toRecalc)
      .sort(compareByIndex)
      .forEach(scenario => {
        Object.values(scenario.rows)
          .sort(compareByIndex)
          .forEach(row => {
            bindFnToRow(
              this,
              this.#meta.intervals,
              scenario,
              row,
              row.fn,
              row.fnArgs,
              row.dependsOn
            );
            calculateRow(row, scenario, 0, intervals.count - 1, this.set);
          });
      });
  }

  stringify(args) {
    return serializer.stringify(this.#meta, args);
  }
}

module.exports = Model;
