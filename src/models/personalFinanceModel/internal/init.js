const keys = require("./keys");
const { defaultScenario } = require("../../model/modelMetadata");
const { previous } = require("../../../fns/lookupFunctions");
const { identity } = require("../../../fns/shadowFunctions");

const addExternals = model => {
  model.addRow({
    rowKey: keys.inflationRow,
    constants: [0],
    fn: previous
  });
};

const addInflationAdjusted = model => {
  model.addScenario({
    scenarioKey: `${defaultScenario}${keys.inflationAdjustedSuffix}`,
    shadowFn: identity
  });
};

const init = model => {
  addExternals(model);
  addInflationAdjusted(model);
};

module.exports = init;
