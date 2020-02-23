const functionsDictionary = require("../../../../fns/functionsDictionary");
const { lookup } = require("../../../../fns/lookupFunctions");
const { multiply } = require("../../../../maths/arithmeticOperations");
const keys = require("../keys");

const applyInflation = (rowContext, interval, value) => {
  const { baseScenario, fnArgs } = rowContext;
  if (fnArgs[keys.inflation.fnArgs.adjustForInflation]) {
    const multiplierContext = {
      ...rowContext,
      scenario: baseScenario
    };
    const multiplier = lookup(multiplierContext, interval);
    return multiply(value, multiplier);
  } else {
    return value;
  }
};
applyInflation.key = keys.inflation.fn.applyInflation;

functionsDictionary.add(applyInflation);

module.exports = applyInflation;
