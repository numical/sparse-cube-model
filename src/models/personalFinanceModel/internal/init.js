const keys = require("./keys");
const { defaultScenario } = require("../../model/modelMetadata");
const { previous } = require("../../../fns/lookupFunctions");
const { identity } = require("../../../fns/shadowFunctions");

const addExternals = (model, { inflation = 0 }) => {
  model.addRow({
    rowKey: keys.inflation.row,
    constants: [inflation],
    fn: previous
  });
};

const addInflationAdjusted = model => {
  model.addScenario({
    scenarioKey: `${defaultScenario}${keys.inflation.adjustedSuffix}`,
    shadowFn: identity
  });
};

const init = (model, meta = {}) => {
  addExternals(model, meta);
  addInflationAdjusted(model);
};

module.exports = init;
