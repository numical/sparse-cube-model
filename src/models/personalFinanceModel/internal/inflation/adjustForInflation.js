const functionsDictionary = require("../../../../fns/functionsDictionary");
const { add, divide, power } = require("../../../../maths/coreOperations");
const { lookup, intervalsPerYear } = require("../../../../fns/lookupFunctions");
const keys = require("../keys");

const cache = new Map();

const annualInflationAdjustment = (inflationRate, rowContext) => {
  if (cache.has(inflationRate)) {
    return cache.get(inflationRate);
  } else {
    const adj = divide(
      add(1, divide(inflationRate, 100)),
      intervalsPerYear(rowContext)
    );
    cache.set(inflationRate, adj);
    return adj;
  }
};

const adjustForInflation = (rowContext, interval, value) => {
  const { baseScenario, fnArgs } = rowContext;
  if (fnArgs[keys.inflation.applyInflation]) {
    const inflationRateContext = {
      ...rowContext,
      scenario: baseScenario
    };
    const inflationRate = lookup(inflationRateContext, interval);
    return divide(
      value,
      power(annualInflationAdjustment(inflationRate, rowContext), interval)
    );
  } else {
    return value;
  }
};
adjustForInflation.key = keys.inflation.adjustShadowFn;

functionsDictionary.add(adjustForInflation);

module.exports = adjustForInflation;
