const Dense3DArray = require("../../data-structures/Dense3DArray");
const modelMetadata = require("./modelMetadata");
const shadowFunctionWrapper = require("./internal/shadow/shadowFunctionWrapper");
const prepareRowConstants = require("./internal/row/prepareRowConstants");
const calculateRow = require("./internal/row/calculateRow");
const bindFnToRow = require("./internal/row/bindFnToRow");
const editRow = require("./internal/row/editRow");
const deleteSingleRow = require("./internal/row/deleteSingleRow");
const ensureAllConstantsDefined = require("./internal/validate/ensureAllConstantsDefined");
const linkAllDependentRows = require("./internal/dependent/linkAllDependentRows");
const linkDependentRows = require("./internal/dependent/linkDependentRows");
const sortByDependency = require("./internal/dependent/sortByDependency");
const sortByShadows = require("./internal/shadow/sortByShadows");
const wrapShadowFns = require("./internal/shadow/wrapShadowFns");
const wrapAllShadowFns = require("./internal/shadow/wrapAllShadowFns");
const validateFn = require("./internal/validate/validateFn");
const validateFnArgs = require("./internal/validate/validateFnArgs");
const validateRow = require("./internal/validate/validateRow");
const validateScenario = require("./internal/validate/validateScenario");
const serializer = require("./serializer");

const { defaultScenario, defaultValue } = modelMetadata;

class Model extends Dense3DArray {
  static parse(serialized, fnsRepo) {
    const meta = serializer.parse(serialized, fnsRepo);
    return new Model(meta);
  }

  #meta;

  constructor(meta = {}) {
    super({ defaultValue });
    this.#meta = modelMetadata(meta);
    const { scenarios } = this.#meta;
    wrapAllShadowFns(scenarios);
    linkAllDependentRows(scenarios);
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
    const scenario = validateScenario({ scenarioName, scenarios });
    validateRow({ rowName, scenario, shouldExist: false });
    validateFn({ fn });
    validateFnArgs({ fn, fnArgs });
    const { rowConstants } = prepareRowConstants({
      constants,
      start,
      end,
      intervals
    });
    if (!fn) {
      ensureAllConstantsDefined(rowConstants, intervals);
    }
    linkDependentRows(scenario, rowName, dependsOn);
    const row = {
      name: rowName,
      index: this.lengths.y,
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
    const rowsToCalculate = Object.entries(scenario.shadows || {}).reduce(
      (rowsToCalculate, [shadowScenarioName, shadowFn]) => {
        const shadowScenario = scenarios[shadowScenarioName];
        const shadowRow = {
          name: row.name,
          index: row.index,
          constants: []
        };
        bindFnToRow(
          this,
          this.#meta.intervals,
          shadowScenario,
          shadowRow,
          shadowFunctionWrapper(shadowFn, scenario)
        );
        shadowScenario.rows[row.name] = shadowRow;
        rowsToCalculate.push({ row: shadowRow, scenario: shadowScenario });
        return rowsToCalculate;
      },
      [{ row, scenario }]
    );
    rowsToCalculate.forEach(({ row, scenario }) => {
      calculateRow(row, scenario, 0, intervals.count - 1, this.set);
    });
  }

  addRows({ rows = [], scenarioName = defaultScenario }) {
    const { intervals, scenarios } = this.#meta;
    const scenario = validateScenario({ scenarioName, scenarios });
    if (rows.length === 0) {
      throw new Error("At least one row must be added.");
    }
    const rowNames = rows.map(({ rowName }) => rowName);
    rowNames.forEach(rowName =>
      validateRow({ rowName, scenario, shouldExist: false })
    );
    const allDependencies = rows.reduce((dependencies, { dependsOn }) => {
      if (dependsOn) {
        if (typeof dependsOn === "object") {
          dependencies.push(...Object.values(dependsOn));
        } else {
          dependencies.push(dependsOn);
        }
      }
      return dependencies;
    }, []);
    const availableRowNames = [...Object.keys(scenario.rows), ...rowNames];
    allDependencies.forEach(dependency => {
      if (!availableRowNames.includes(dependency)) {
        throw new Error(`Depends on unknown row '${dependency}'`);
      }
    });
    // yuk - ensure that values are not double-mapped by calling explicit Model method
    const addRow = Model.prototype.addRow.bind(this);
    rows
      .sort(sortByDependency)
      .map(rowData => ({ ...rowData, scenarioName }))
      .forEach(addRow);
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
    validateFn({ fn });
    validateFnArgs({ fn, fnArgs });
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
    validateFn({ fn });
    validateFnArgs({ fn: fn || row.fn, fnArgs });
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

  addScenario({
    scenarioName,
    baseScenarioName = defaultScenario,
    shadowFn
  } = {}) {
    const { scenarios } = this.#meta;
    validateScenario({ scenarioName, scenarios, shouldExist: false });
    const baseScenario = scenarios[baseScenarioName];
    if (!baseScenario) {
      throw new Error(`Unknown scenario '${baseScenarioName}'`);
    }
    if (shadowFn) {
      validateFn({ fn: shadowFn });
    }
    const copiedRows = Object.entries(baseScenario.rows).reduce(
      (copy, [rowName, row]) => {
        const fn = shadowFn || row.fn.unbound;
        copy[rowName] = {
          ...row,
          fn
        };
        return copy;
      },
      {}
    );
    const scenario = {
      index: this.isEmpty() ? 1 : this.lengths.z,
      rows: copiedRows
    };
    if (shadowFn) {
      scenario.isShadow = true;
      const shadows = baseScenario.shadows || {};
      shadows[scenarioName] = shadowFn;
      baseScenario.shadows = shadows;
      wrapShadowFns(scenario, shadowFn, baseScenario);
    }
    scenarios[scenarioName] = scenario;
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
    const { intervals, scenarios } = this.#meta;
    const toRecalc = scenarioName ? [scenarios[scenarioName]] : scenarios;
    Object.values(toRecalc)
      .sort(sortByShadows)
      .forEach(scenario => {
        Object.values(scenario.rows)
          .sort(sortByDependency)
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
