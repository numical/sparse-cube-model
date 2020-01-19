const { clone } = require("ramda");
const calculateRow = require("./calculateRow");
const bindFnToRow = require("./bindFnToRow");
const prepareRowConstants = require("./prepareRowConstants");
const ensureAllConstantsDefined = require("../validate/ensureAllConstantsDefined");
const linkDependentRows = require("../dependent/linkDependentRows");
const unlinkDependentRows = require("../dependent/unlinkDependentRows");

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
  linkDependentRows(scenario, row.key, dependsOn);
  bindFnToRow(model, intervals, scenario, row, fn, fnArgs, dependsOn);
  row.constants = rowConstants;
  unlinkDependentRows(scenario, row.key, row.dependsOn);
  linkDependentRows(scenario, row.key, dependsOn);
  const rowstoUpdate = [row];
  if (row.dependents) {
    rowstoUpdate.push(
      ...row.dependents.map(
        dependencyRowName => scenario.rows[dependencyRowName]
      )
    );
  }
  rowstoUpdate.forEach(row => {
    calculateRow(row, scenario, startInterval, intervals.count, model.set);
  });
  return original;
};

module.exports = editRow;
