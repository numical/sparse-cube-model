const adjustForInflation = require("./adjustForInflation");
const keys = require("../keys");
const { defaultScenario } = require("../../../model/modelMetadata");
const { previous } = require("../../../../fns/lookupFunctions");

const rowKey = keys.inflation.row;

const setInflation = (model, rates = 0) => {
  const args = {
    rowKey,
    constants: rates,
    fn: previous
  };
  try {
    model.row({ rowKey });
    model.updateRow(args);
  } catch {
    model.addRow(args);
    model.addScenario({
      scenarioKey: `${defaultScenario}${keys.inflation.adjustedSuffix}`,
      shadowFn: adjustForInflation
    });
  }
};

module.exports = setInflation;
