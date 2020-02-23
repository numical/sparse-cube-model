const { clone } = require("ramda");
const calculateRow = require("./calculateRow");
const bindFnToRow = require("./bindFnToRow");
const prepareRowConstants = require("./prepareRowConstants");
const ensureAllConstantsDefined = require("../validate/ensureAllConstantsDefined");
const linkDependentRows = require("../dependent/addToRowDependents");
const unlinkDependentRows = require("../dependent/removeFromRowDependents");

const intersects = (array1, array2) => {
  for (const element of array1) {
    if (array2.includes(element)) return true;
  }
  return false;
};

const relinkDependencies = (scenario, row, dependsOn) => {
  unlinkDependentRows(scenario, row.key, row.dependsOn);
  linkDependentRows(scenario, row.key, dependsOn);
};

const collateRowsToRecalculate = (scenario, row) => {
  const rowstoUpdate = [row];
  if (row.dependents && row.dependents.rows) {
    rowstoUpdate.push(
      ...row.dependents.rows.map(
        dependencyRowName => scenario.rows[dependencyRowName]
      )
    );
  }
  return rowstoUpdate;
};

const collateScenariosToRecalculate = (scenario, rows) => {
  const rowKeys = rows.map(row => row.key);
  const scenarioKeys = [];
  if (scenario.shadows) {
    Object.entries(scenario.shadows).forEach(
      ([shadowScenarioKey, { dependsOn }]) => {
        if (dependsOn) {
          if (intersects(Object.values(dependsOn), rowKeys)) {
            scenarioKeys.push(shadowScenarioKey);
          }
        }
      }
    );
  }
  return scenarioKeys;
};

const editRow = ({
  model,
  scenario,
  row,
  intervals,
  fn,
  fnArgs,
  constants,
  existingConstants,
  dependsOn
}) => {
  const original = clone(row);
  const { rowConstants, startInterval } = prepareRowConstants({
    fn,
    constants,
    existingConstants,
    intervals
  });
  if (!fn) {
    ensureAllConstantsDefined(rowConstants, intervals);
  }
  bindFnToRow(model, intervals, scenario, row, fn, fnArgs, dependsOn);
  row.constants = rowConstants;
  relinkDependencies(scenario, row, dependsOn);
  const rowsToRecalculate = collateRowsToRecalculate(scenario, row);
  rowsToRecalculate.forEach(row => {
    calculateRow(row, scenario, startInterval, intervals.count, model.set);
  });
  collateScenariosToRecalculate(scenario, rowsToRecalculate).forEach(
    scenarioKey => {
      model.recalculate({ scenarioKey });
    }
  );
  return original;
};

module.exports = editRow;
