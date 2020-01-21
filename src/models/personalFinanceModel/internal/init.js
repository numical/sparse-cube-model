const keys = require("./keys");
const { defaultScenario } = require("../../model/modelMetadata");
const { previous } = require("../../../fns/lookupFunctions");
const { identity } = require("../../../fns/shadowFunctions");

const addExternals = model => {
  model.addRow({
    rowKey: keys.inflation.row,
    constants: [0],
    fn: previous
  });
};

const addInflationAdjusted = model => {
  model.addScenario({
    scenarioKey: `${defaultScenario}${keys.inflation.adjustedSuffix}`,
    shadowFn: identity
  });
};

const init = model => {
  addExternals(model);
  addInflationAdjusted(model);
};

module.exports = init;
