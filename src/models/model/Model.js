const Dense3DArray = require("../../data-structures/Dense3DArray");
const modelMetadata = require("./modelMetadata");
const shadowFunctionWrapper = require("./internal/shadow/shadowFunctionWrapper");
const prepareRowConstants = require("./internal/row/prepareRowConstants");
const calculateRow = require("./internal/row/calculateRow");
const bindFnToRow = require("./internal/row/bindFnToRow");
const editRow = require("./internal/row/editRow");
const deleteRowAndShadows = require("./internal/row/deleteRowAndShadows");
const ensureAllConstantsDefined = require("./internal/validate/ensureAllConstantsDefined");
const getDateFromInterval = require("./internal/date/getDateFromInterval");
const getModelVersion = require("./internal/version/getModelVersion");
const addToAllRowDependents = require("./internal/dependent/addToAllRowDependents");
const addToRowDependents = require("./internal/dependent/addToRowDependents");
const removeFromRowDependents = require("./internal/dependent/removeFromRowDependents");
const sortByDependency = require("./internal/dependent/sortByDependency");
const sortByShadows = require("./internal/shadow/sortByShadows");
const wrapShadowFns = require("./internal/shadow/wrapShadowFns");
const wrapAllShadowFns = require("./internal/shadow/wrapAllShadowFns");
const validateDependsOn = require("./internal/validate/validateDependsOn");
const validateFn = require("./internal/validate/validateFn");
const validateFnArgs = require("./internal/validate/validateFnArgs");
const validateRow = require("./internal/validate/validateRow");
const validateCanDeleteRow = require("./internal/dependent/validateCanDeleteRow");
const validateCanDeleteAllRows = require("./internal/dependent/validateCanDeleteAllRows");
const validateScenario = require("./internal/validate/validateScenario");
const validateVersion = require("./internal/version/validateVersion");
const serializer = require("./serializer");

const { defaultScenario, defaultValue } = modelMetadata;

class Model extends Dense3DArray {
  static parse(serialized, fnsRepo) {
    const meta = serializer.parse(serialized, fnsRepo);
    return new Model(meta);
  }

  #meta;
  #dates; // lazily instantiated

  constructor(meta = {}) {
    super({ defaultValue });
    this.#meta = modelMetadata(meta);
    validateVersion(this.#meta.version);
    const { scenarios } = this.#meta;
    wrapAllShadowFns(scenarios);
    addToAllRowDependents(scenarios);
    this.recalculate();
  }

  addRow({
    rowKey,
    scenarioKey = defaultScenario,
    fn,
    fnArgs,
    start,
    end,
    constants,
    dependsOn
  }) {
    const { intervals, scenarios } = this.#meta;
    const scenario = validateScenario({ scenarioKey, scenarios });
    validateRow({ rowKey, scenario, shouldExist: false });
    validateFn({ fn });
    validateFnArgs({ fn, fnArgs });
    validateDependsOn({ dependsOn });
    const { rowConstants } = prepareRowConstants({
      constants,
      start,
      end,
      intervals
    });
    if (!fn) {
      ensureAllConstantsDefined(rowConstants, intervals);
    }
    addToRowDependents(scenario, rowKey, dependsOn);
    const row = {
      key: rowKey,
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
    scenario.rows[rowKey] = row;
    const rowsToCalculate = Object.entries(scenario.shadows || {}).reduce(
      (rowsToCalculate, [shadowScenarioName, shadow]) => {
        const shadowScenario = scenarios[shadowScenarioName];
        const shadowRow = {
          key: row.key,
          index: row.index,
          constants: []
        };
        bindFnToRow(
          this,
          this.#meta.intervals,
          shadowScenario,
          shadowRow,
          shadowFunctionWrapper({ ...shadow, baseScenario: scenario })
        );
        shadowScenario.rows[row.key] = shadowRow;
        rowsToCalculate.push({ row: shadowRow, scenario: shadowScenario });
        return rowsToCalculate;
      },
      [{ row, scenario }]
    );
    rowsToCalculate.forEach(({ row, scenario }) => {
      calculateRow(row, scenario, 0, intervals.count, this.set);
    });
  }

  addRows({ rows = [], scenarioKey = defaultScenario }) {
    const { intervals, scenarios } = this.#meta;
    const scenario = validateScenario({ scenarioKey, scenarios });
    if (rows.length === 0) {
      throw new Error("At least one row must be added.");
    }
    const rowKeys = rows.map(({ rowKey }) => rowKey);
    rowKeys.forEach(rowKey =>
      validateRow({ rowKey, scenario, shouldExist: false })
    );
    const allDependencies = rows.reduce((dependencies, { dependsOn }) => {
      if (dependsOn) {
        dependencies.push(...Object.values(dependsOn));
      }
      return dependencies;
    }, []);
    const availableRowNames = [...Object.keys(scenario.rows), ...rowKeys];
    allDependencies.forEach(dependency => {
      if (!availableRowNames.includes(dependency)) {
        throw new Error(`Depends on unknown row '${dependency}'`);
      }
    });
    // yuk - ensure that values are not double-mapped by calling explicit Model method
    const addRow = Model.prototype.addRow.bind(this);
    rows
      .sort(sortByDependency)
      .map(rowData => ({ ...rowData, scenarioKey }))
      .forEach(addRow);
  }

  updateRow({
    rowKey,
    scenarioKey = defaultScenario,
    fn,
    fnArgs,
    constants,
    dependsOn
  }) {
    const { intervals, scenarios } = this.#meta;
    const scenario = validateScenario({ scenarioKey, scenarios });
    const row = validateRow({ rowKey, scenario });
    validateFn({ fn });
    validateFnArgs({ fn, fnArgs });
    validateDependsOn({ dependsOn });
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
    rowKey,
    scenarioKey = defaultScenario,
    fn,
    fnArgs,
    constants,
    dependsOn
  }) {
    const { intervals, scenarios } = this.#meta;
    const scenario = validateScenario({ scenarioKey, scenarios });
    const row = validateRow({ rowKey, scenario });
    validateFn({ fn });
    validateFnArgs({ fn: fn || row.fn, fnArgs });
    validateDependsOn({ dependsOn });
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

  deleteRow({ rowKey, scenarioKey = defaultScenario }) {
    const { scenarios } = this.#meta;
    const scenario = validateScenario({ scenarioKey, scenarios });
    const row = validateRow({ rowKey, scenario });
    validateCanDeleteRow(row);
    return deleteRowAndShadows(this, scenarios, scenario, row);
  }

  deleteRows({ rowKeys, scenarioKey = defaultScenario }) {
    const { scenarios } = this.#meta;
    const scenario = validateScenario({ scenarioKey, scenarios });
    const rows = rowKeys.map(rowKey => validateRow({ rowKey, scenario }));
    validateCanDeleteAllRows(rows);
    // delete from largest index downwards
    return rows
      .sort((r1, r2) => r2.index - r1.index)
      .reduce(
        (deletedRows, toDelete) => {
          const { row, shadowRows } = deleteRowAndShadows(
            this,
            scenarios,
            scenario,
            toDelete
          );
          deletedRows.rows.unshift(row);
          deletedRows.shadowRows.unshift(...shadowRows);
          return deletedRows;
        },
        { rows: [], shadowRows: [] }
      );
  }

  row({ rowKey, scenarioKey = defaultScenario }) {
    const { scenarios } = this.#meta;
    const scenario = validateScenario({
      scenarioKey,
      scenarios,
      toEdit: false
    });
    const row = validateRow({ rowKey, scenario });
    return this.range({ y: row.index, z: scenario.index });
  }

  scenario({ scenarioKey = defaultScenario, includeDates = false } = {}) {
    const { scenarios, intervals } = this.#meta;
    const scenario = validateScenario({
      scenarioKey,
      scenarios,
      toEdit: false
    });
    const rows = this.isEmpty() ? [] : this.range({ z: scenario.index });
    if (includeDates) {
      if (!this.#dates) {
        const fn = getDateFromInterval(intervals);
        this.#dates = Array.from({ length: intervals.count + 1 }, (_, i) =>
          fn(i)
        );
      }
      rows.unshift(this.#dates);
    }
    return rows;
  }

  addScenario({ scenarioKey, baseScenarioKey = defaultScenario, shadow } = {}) {
    const { scenarios } = this.#meta;
    validateScenario({ scenarioKey, scenarios, shouldExist: false });
    const baseScenario = scenarios[baseScenarioKey];
    if (!baseScenario) {
      throw new Error(`Unknown scenario '${baseScenarioKey}'`);
    }
    if (shadow) {
      validateFn(shadow);
      validateFnArgs(shadow);
      validateDependsOn(shadow);
    }
    const copiedRows = Object.entries(baseScenario.rows).reduce(
      (copy, [rowKey, row]) => {
        const fn = shadow ? shadow.fn : row.fn.unbound;
        copy[rowKey] = {
          ...row,
          fn
        };
        return copy;
      },
      {}
    );
    const scenario = {
      baseScenarioKey,
      index: this.isEmpty() ? 1 : this.lengths.z,
      rows: copiedRows
    };
    if (shadow) {
      scenario.shadow = shadow;
      const shadows = baseScenario.shadows || {};
      shadows[scenarioKey] = shadow;
      baseScenario.shadows = shadows;
      wrapShadowFns({
        scenario,
        baseScenario,
        ...shadow
      });
      addToRowDependents(
        baseScenario,
        baseScenarioKey,
        shadow.dependsOn,
        "scenario"
      );
    }
    scenarios[scenarioKey] = scenario;
    this.recalculate({ scenarioKey });
  }

  deleteScenario({ scenarioKey } = {}) {
    const { scenarios } = this.#meta;
    const scenario = validateScenario({
      scenarioKey,
      scenarios,
      toEdit: false
    });
    if (Object.keys(scenarios).length === 1) {
      throw new Error(`Cannot delete only scenario '${scenarioKey}'.`);
    }
    const { baseScenarioKey, shadow, shadows } = scenario;
    if (shadows) {
      const shadowNames = Object.keys(shadows).join(", ");
      throw new Error(
        `Cannot delete scenario '${scenarioKey}' with shadows '${shadowNames}'.`
      );
    }
    delete scenarios[scenarioKey];
    if (!this.isEmpty()) {
      this.delete({ z: scenario.index });
    }
    if (shadow) {
      Object.values(scenarios).forEach(scenario => {
        if (scenario.shadows && scenario.shadows[scenarioKey]) {
          delete scenario.shadows[scenarioKey];
          if (Object.keys(scenario.shadows).length === 0) {
            delete scenario.shadows;
          }
        }
      });
      removeFromRowDependents(
        scenarios[baseScenarioKey],
        baseScenarioKey,
        shadow.dependsOn,
        "scenario"
      );
    }
    return scenario;
  }

  recalculate({ scenarioKey } = {}) {
    const { intervals, scenarios } = this.#meta;
    const toRecalc = scenarioKey ? [scenarios[scenarioKey]] : scenarios;
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
            calculateRow(row, scenario, 0, intervals.count, this.set);
          });
      });
  }

  stringify(args) {
    this.#meta.version = getModelVersion();
    return serializer.stringify(this.#meta, args);
  }
}

module.exports = Model;
