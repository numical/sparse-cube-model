const adjustForInflation = require("./applyInflation");
const calculateMultiplier = require("./calculateMultiplier");
const keys = require("../keys");
const { defaultScenario } = require("../../../model/modelMetadata");
const { previous } = require("../../../../fns/lookupFunctions");

const addInflationShadowScenario = ({ model }) => {
  model.addScenario({
    scenarioKey: `${defaultScenario}${keys.inflation.adjustedSuffix}`,
    shadow: {
      fn: adjustForInflation,
      dependsOn: { lookup: keys.inflation.row }
    }
  });
};

const setInflation = ({ model, rates = 0 }) => {
  const rateArgs = {
    rowKey: keys.inflation.row.rate,
    constants: rates,
    fn: previous
  };
  if (model.hasRow(rateArgs)) {
    model.updateRow(rateArgs);
  } else {
    model.addRow(rateArgs);
    model.addRow({
      rowKey: keys.inflation.row.multiplier,
      fn: calculateMultiplier,
      dependsOn: { lookup: keys.inflation.row.rate }
    });
    model.addScenario({
      scenarioKey: `${defaultScenario}${keys.inflation.scenario.suffix}`,
      shadow: {
        fn: adjustForInflation,
        dependsOn: { lookup: keys.inflation.row.multiplier }
      }
    });
  }
};

module.exports = setInflation;
