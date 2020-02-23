const Dense3DArray = require("../../data-structures/Dense3DArray");
const modelMetadata = require("./modelMetadata");
const shadowFunctionWrapper = require("./internal/shadow/shadowFunctionWrapper");
const prepareRowConstants = require("./internal/row/prepareRowConstants");
const calculateRow = require("./internal/row/calculateRow");
const bindFnToRow = require("./internal/row/bindFnToRow");
const editRow = require("./internal/row/editRow");
const indexOfRowKey = require("./internal/row/indexOfRowKey");
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
    // does rowKey exist in another scenario - if so check it has defaulted values here
    const existingIndex = indexOfRowKey(rowKey, scenarios);
    if (existingIndex > -1) {
      const existingValues = this.range({
        y: existingIndex,
        z: scenario.index
      });
      if (existingValues.some(value => value !== defaultValue)) {
        throw new Error(
          `Adding previously deleted row '${rowKey}' to scenario '${scenarioKey}' would overwrite non-default values.`
        );
      }
    }
    const index = existingIndex > -1 ? existingIndex : this.lengths.y;
    const row = {
      key: rowKey,
      index,
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
    // add row to shadows and add to array of rows to recalculate
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
    const ret = editRow({
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
    return ret;
  }

  deleteRow({ rowKey, scenarioKey = defaultScenario }) {
    const { scenarios } = this.#meta;
    const scenario = validateScenario({ scenarioKey, scenarios });
    const row = validateRow({ rowKey, scenario });
    validateCanDeleteRow(row);

    // delete row in scenario and its shadows
    const affectedScenarios = scenario.shadows
      ? [scenario, ...Object.keys(scenario.shadows).map(key => scenarios[key])]
      : [scenario];
    affectedScenarios.forEach(affectedScenario => {
      if (!affectedScenario.rows) {
        console.log();
      }
      const { index, dependsOn } = affectedScenario.rows[rowKey];
      removeFromRowDependents(affectedScenario, rowKey, dependsOn);
      delete affectedScenario.rows[rowKey];
      for (let x = 0; x < this.lengths.x; x++) {
        // note: do not delete row as might be used by other scenarios
        this.set(x, index, affectedScenario.index, defaultValue);
      }
    });

    const rowKeyStillInUse = Object.values(scenarios).some(
      scenario => !!scenario.rows[rowKey]
    );
    // if rowKey does not exist anywhere else...
    if (!rowKeyStillInUse) {
      const { index } = row;
      // ... delete whole row of Dense3DArray
      this.delete({ y: index });
      // ... and update rows metadata
      affectedScenarios.forEach(affectedScenario => {
        Object.values(affectedScenario.rows).forEach(row => {
          if (row.index > index) {
            row.index = row.index - 1;
          }
        });
      });
    }
    return { row, rowKeyStillInUse };
  }

  deleteRows({ rowKeys, scenarioKey = defaultScenario }) {
    const { scenarios } = this.#meta;
    const scenario = validateScenario({ scenarioKey, scenarios });
    const rows = rowKeys.map(rowKey => validateRow({ rowKey, scenario }));
    validateCanDeleteAllRows(rows);
    // ensure that values are not double-mapped by calling explicit Model method
    // delete in reverse order but return in passed order
    const deleteRow = Model.prototype.deleteRow.bind(this);
    const deletedRows = rows
      .sort((row1, row2) => row2.index - row1.index)
      .reduce((deletedRows, row) => {
        deletedRows.push(
          deleteRow({
            rowKey: row.key,
            scenarioKey
          })
        );
        return deletedRows;
      }, []);
    return deletedRows.sort(
      ({ row: row1 }, { row: row2 }) => row1.index - row2.index
    );
  }

  hasRow({ rowKey, scenarioKey = defaultScenario }) {
    const { scenarios } = this.#meta;
    const scenario = validateScenario({
      scenarioKey,
      scenarios,
      toEdit: false
    });
    return !!scenario.rows[rowKey];
  }

  row({ rowKey, scenarioKey = defaultScenario }) {
    const { scenarios } = this.#meta;
    const scenario = validateScenario({
      scenarioKey,
      scenarios,
      toEdit: false
    });
    if (!rowKey) {
      throw new Error("A row key is required.");
    }
    const row = validateRow({ rowKey, scenario });
    return this.range({ y: row.index, z: scenario.index });
  }

  hasScenario({ scenarioKey = defaultScenario } = {}) {
    const { scenarios } = this.#meta;
    return !!scenarios[scenarioKey];
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
        const constants = shadow ? [] : row.constants;
        const dependsOn = shadow ? undefined : row.dependsOn;
        copy[rowKey] = {
          ...row,
          fn,
          constants,
          dependsOn
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
