const adjustForInflation = require("./applyInflation");
const calculateMultiplier = require("./calculateMultiplier");
const inflationAdjustedScenarioKey = require("./inflationAdjustedScenarioKey");
const keys = require("../keys");
const { previous } = require("../../../../fns/lookupFunctions");

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
      scenarioKey: inflationAdjustedScenarioKey(),
      shadow: {
        fn: adjustForInflation,
        dependsOn: { lookup: keys.inflation.row.multiplier }
      }
    });
  }
};

module.exports = setInflation;
