const { clone } = require("ramda");
const calculateRow = require("./calculateRow");
const bindFnToRow = require("./bindFnToRow");
const prepareRowConstants = require("./prepareRowConstants");
const ensureAllConstantsDefined = require("./ensureAllConstantsDefined");
const linkDependentRows = require("./linkDependentRows");
const unlinkDependentRows = require("./unlinkDependentRows");

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
  const rowConstants = prepareRowConstants({
    fn,
    constants,
    existingConstants,
    intervals
  });
  const startInterval = 0;
  if (!fn) {
    ensureAllConstantsDefined(rowConstants, intervals);
  }
  linkDependentRows(scenario, row.name, dependsOn);
  bindFnToRow(model, intervals, scenario, row, fn, fnArgs, dependsOn);
  row.constants = rowConstants;
  unlinkDependentRows(scenario, row.name, row.dependsOn);
  linkDependentRows(scenario, row.name, dependsOn);
  const rowstoUpdate = [row];
  if (row.dependents) {
    rowstoUpdate.push(
      ...row.dependents.map(
        dependencyRowName => scenario.rows[dependencyRowName]
      )
    );
  }
  rowstoUpdate.forEach(row => {
    calculateRow(row, scenario, startInterval, intervals.count - 1, model.set);
  });
  return original;
};

module.exports = editRow;
