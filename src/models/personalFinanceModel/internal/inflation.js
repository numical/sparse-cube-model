const keys = require("./keys");
const { defaultScenario } = require("../../model/modelMetadata");
const { previous } = require("../../../fns/lookupFunctions");
const { identity } = require("../../../fns/shadowFunctions");

const rowKey = keys.inflation.row;

set = (model, rate = 0) => {
  const args = {
    rowKey,
    constants: [rate],
    fn: previous
  };
  try {
    model.row({ rowKey });
    model.patchRow(args);
  } catch {
    model.addRow(args);
    model.addScenario({
      scenarioKey: `${defaultScenario}${keys.inflation.adjustedSuffix}`,
      shadowFn: identity
    });
  }
};

module.exports = {
  set
};
