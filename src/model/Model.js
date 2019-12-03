const Dense3DArray = require("../data-structures/Dense3DArray");
const modelMetadata = require("./modelMetadata");
const getIntervalFromDate = require("./getIntervalFromDate");
const serializer = require("./serializer");

const { defaultScenario } = modelMetadata;
const defaultValue = 0;

const compareByIndex = ({ index: index1 }, { index: index2 }) =>
  index1 - index2;

const getRow = (rowName, scenarioName, scenarios) => {
  const scenario = scenarios[scenarioName];
  if (!scenario) {
    throw new Error(`Unknown scenario '${scenarioName}'`);
  }
  const row = scenario.rows[rowName];
  if (!row) {
    throw new Error(`Unknown row '${rowName}'`);
  }
  return { row, scenario };
};

const calculateRow = (row, scenario, startInterval, endInterval, set) => {
  for (let interval = startInterval; interval <= endInterval; interval++) {
    const value =
      row.constants[interval] === undefined
        ? row.fn(interval)
        : row.constants[interval];
    set(interval, row.index, scenario.index, value);
  }
};

const bindFnToRow = (row, scenario, model, fn, fnArgs) => {
  if (fn) {
    const boundFn = fn.bind(this, { model, scenario, row, ...fnArgs });
    boundFn.key = fn.key;
    row.fn = boundFn;
    row.fnArgs = fnArgs;
  } else {
    row.fn = undefined;
    row.fnArgs = undefined;
  }
};

const prepareRowConstants = (
  fn,
  constants,
  start,
  end,
  intervals,
  existingConstants
) => {
  if (!fn && !constants) {
    throw new Error("No function or constants passed.");
  }
  if (fn && !fn.key) {
    throw new Error(`function '${fn.name}' must have a 'key' property.`);
  }
  if (!constants) {
    const rowConstants =
      end < intervals.count - 1
        ? Array(intervals.count)
        : start > 0
        ? Array(start)
        : [];
    if (start > 0) {
      for (let index = 0; index < start; index++) {
        rowConstants[index] = defaultValue;
      }
    }
    if (end < intervals.count - 1) {
      for (let index = end + 1; index < intervals.count; index++) {
        rowConstants[index] = defaultValue;
      }
    }
    return {
      rowConstants,
      startInterval: start,
      endInterval: end
    };
  }
  if (typeof constants !== "object") {
    throw new Error("Constants must be an array or an object.");
  }
  const isArray = Array.isArray(constants);
  if (!fn) {
    const values = isArray ? constants : Object.values(constants);
    if (values.length < end - start) {
      throw new Error(
        `Row has no function, but less constants than intervals.`
      );
    } else if (values.some(value => value === undefined)) {
      throw new Error(`Row has no function, but undefined constants.`);
    }
  }
  if (isArray) {
    const startInterval =
      start > 0
        ? start
        : existingConstants
        ? constants.reduce(
            (min, value, index) =>
              value !== undefined ? (index < min ? index : min) : min,
            constants.length
          )
        : 0;
    const startDefaultArray = Array(start).fill(defaultValue);
    const calculatedValuesArray = Array(end + 1 - constants.length - start);
    const endDefaultArray = Array(intervals.count - 1 - end).fill(defaultValue);
    const rowConstants = [
      ...startDefaultArray,
      ...constants,
      ...calculatedValuesArray,
      ...endDefaultArray
    ];
    return {
      rowConstants,
      startInterval,
      endInterval: end
    };
  }
  Object.keys(constants).forEach(constant => {
    if (Number.isNaN(Number.parseInt(constant))) {
      throw new Error(`Constant key '${constant}' must be an integer.`);
    } else if (constant > end) {
      throw new Error(`Constant index ${constant} must be ${end} or less.`);
    } else if (constant < start) {
      throw new Error(`Constant index ${constant} must be ${start} or more.`);
    }
  });
  const rowConstants = existingConstants || [
    ...Array(start).fill(defaultValue),
    ...Array(end + 1 - start),
    ...Array(intervals.count - 1 - end).fill(defaultValue)
  ];
  const startInterval = Object.entries(constants).reduce(
    (min, [index, value]) => {
      rowConstants[index] = value;
      return index < min ? index : min;
    },
    existingConstants ? intervals.count : start
  );
  return {
    rowConstants,
    startInterval,
    endInterval: end
  };
};

class Model extends Dense3DArray {
  static parse(serialized, fnsRepo) {
    const meta = serializer.parse(serialized, fnsRepo);
    return new Model(meta);
  }

  #meta;
  #getIntervalFromDate;

  constructor(meta = {}) {
    super({ defaultValue });
    this.#meta = modelMetadata(meta);
    this.#getIntervalFromDate = getIntervalFromDate(this.#meta.intervals);
    this.recalculate();
  }

  addRow({
    rowName,
    scenarioName = defaultScenario,
    fn,
    fnArgs,
    start = 0,
    end = this.#meta.intervals.count - 1,
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
    const { rowConstants } = prepareRowConstants(
      fn,
      constants,
      start,
      end,
      intervals
    );
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
    const row = {
      index: y,
      constants: rowConstants,
      name: rowName
    };
    bindFnToRow(row, scenario, this, fn, fnArgs);
    scenario.rows[rowName] = row;
    calculateRow(row, scenario, 0, intervals.count - 1, this.set);

    /*
    // populate remaining columns if necessary
    if (endInterval < intervals.count - 1) {
      this.set(intervals.count - 1, row.index, scenario.index, defaultValue);
    }
    */
  }

  updateRow({
    rowName,
    scenarioName = defaultScenario,
    fn,
    fnArgs,
    constants
  }) {
    const { intervals, scenarios } = this.#meta;
    const { row, scenario } = getRow(rowName, scenarioName, scenarios);
    const { rowConstants, startInterval } = prepareRowConstants(
      fn,
      constants,
      0,
      intervals.count - 1,
      intervals,
      row.constants
    );
    bindFnToRow(row, scenario, this, fn, fnArgs);
    row.constants = rowConstants;
    const rowstoUpdate = [row];
    if (row.dependents) {
      rowstoUpdate.push(
        ...row.dependents.map(
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
    const { scenarios } = this.#meta;
    const { rows, scenario } = rowNames.reduce(
      ({ rows, scenario }, rowName) => {
        const { row: r, scenario: s } = getRow(
          rowName,
          scenarioName,
          scenarios
        );
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
    const { scenarios } = this.#meta;
    const { row, scenario } = getRow(rowName, scenarioName, scenarios);
    return this.range({ y: row.index, z: scenario.index });
  }

  addScenario({ scenarioName, copyOf = defaultScenario } = {}) {
    const { scenarios } = this.#meta;
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

  recalculate() {
    // compareByIndex a good proxy for dependencies
    const { intervals, scenarios } = this.#meta;
    Object.values(scenarios)
      .sort(compareByIndex)
      .forEach(scenario => {
        Object.values(scenario.rows)
          .sort(compareByIndex)
          .forEach(row => {
            bindFnToRow(row, scenario, this, row.fn, row.fnArgs);
            calculateRow(row, scenario, 0, intervals.count - 1, this.set);
          });
      });
  }

  stringify(args) {
    return serializer.stringify(this.#meta, args);
  }
}

module.exports = Model;
