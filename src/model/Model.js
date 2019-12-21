const Dense3DArray = require("../data-structures/Dense3DArray");
const modelMetadata = require("./util/modelMetadata");
const prepareRowConstants = require("./util/prepareRowConstants");
const getRow = require("./util/getRow");
const calculateRow = require("./util/calculateRow");
const bindFnToRow = require("./util/bindFnToRow");
const compareByIndex = require("./util/compareByIndex");
const deleteSingleRow = require("./util/deleteSingleRow");
const linkAllDependentRows = require("./util/linkAllDependentRows");
const linkDependentRows = require("./util/linkDependentRows");
const unlinkDependentRows = require("./util/unlinkDependentRows");
const serializer = require("./util/serializer");
const defaultValue = require("./util/defaultValue");

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
    const { rowConstants } = prepareRowConstants({
      fn,
      constants,
      start,
      end,
      intervals
    });
    linkDependentRows(scenario, rowName, dependsOn);
    const row = {
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
    const { row, scenario } = getRow(rowName, scenarioName, scenarios);
    const { rowConstants, startInterval } = prepareRowConstants({
      fn,
      constants,
      existingConstants: row.constants,
      intervals
    });
    linkDependentRows(scenario, rowName, dependsOn);
    bindFnToRow(
      this,
      this.#meta.intervals,
      scenario,
      row,
      fn,
      fnArgs,
      dependsOn
    );
    row.constants = rowConstants;
    unlinkDependentRows(scenario, rowName, row.dependsOn);
    linkDependentRows(scenario, rowName, dependsOn);
    const rowstoUpdate = [row];
    if (row.dependents) {
      rowstoUpdate.push(
        ...Object.keys(row.dependents).map(
          dependencyRowName =>
            getRow(dependencyRowName, scenarioName, scenarios).row
        )
      );
    }
    rowstoUpdate.forEach(row => {
      calculateRow(row, scenario, startInterval, intervals.count - 1, this.set);
    });
  }

  deleteRow({ rowName, scenarioName = defaultScenario }) {
    const { scenarios } = this.#meta;
    const { row, scenario } = getRow(rowName, scenarioName, scenarios);
    if (row.dependents) {
      throw new Error(
        `Cannot delete row '${rowName}' as rows '${Object.keys(
          row.dependents
        ).join(", ")}' depend on it.`
      );
    }
    deleteSingleRow(this, scenario, row, rowName);
  }

  deleteRows({ rowNames, scenarioName = defaultScenario }) {
    const { scenarios } = this.#meta;
    const { rows, mappedRowNames, scenario } = rowNames.reduce(
      ({ rows, mappedRowNames, scenario }, rowName) => {
        const { row: r, scenario: s } = getRow(
          rowName,
          scenarioName,
          scenarios
        );
        mappedRowNames.set(r, rowName);
        return { rows: [...rows, r], mappedRowNames, scenario: s };
      },
      { rows: [], mappedRowNames: new Map() }
    );
    // can delete all if they are dependent only on each other
    rows.forEach(row => {
      if (row.dependents) {
        Object.keys(row.dependents).forEach(dependent => {
          if (!rowNames.includes(dependent)) {
            throw new Error(
              `Cannot delete row '${mappedRowNames.get(
                row
              )}' as row '${dependent}' depends on it.`
            );
          }
        });
      }
    });
    // delete from largest index downwards
    rows
      .sort((r1, r2) => r2.index - r1.index)
      .forEach(row => {
        const rowName = mappedRowNames.get(row);
        deleteSingleRow(this, scenario, row, rowName);
      });
  }

  row({ rowName, scenarioName = defaultScenario }) {
    const { scenarios } = this.#meta;
    const { row, scenario } = getRow(rowName, scenarioName, scenarios);
    return this.range({ y: row.index, z: scenario.index });
  }

  scenario({ scenarioName = defaultScenario } = {}) {
    const { scenarios } = this.#meta;
    const scenario = scenarios[scenarioName];
    if (!scenario) {
      throw new Error(`Unknown scenario '${scenarioName}'`);
    }
    return this.isEmpty() ? [] : this.range({ z: scenario.index });
  }

  addScenario({ scenarioName, copyOf = defaultScenario } = {}) {
    const { scenarios } = this.#meta;
    if (!scenarioName) {
      throw new Error("A scenario name is required.");
    }
    const scenarioToCopy = scenarios[copyOf];
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

  deleteScenario(scenarioName) {
    const { scenarios } = this.#meta;
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
