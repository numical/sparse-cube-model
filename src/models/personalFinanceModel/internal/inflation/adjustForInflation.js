const functionsDictionary = require("../../../../fns/functionsDictionary");
const { lookup, intervalsPerYear } = require("../../../../fns/lookupFunctions");
const {
  calculateIntervalInflationRate,
  adjustValueForInflation
} = require("../../../../maths/calculateForInflation");
const keys = require("../keys");

const cache = new Map();

const getIntervalInflation = (inflationRate, rowContext) => {
  if (cache.has(inflationRate)) {
    return cache.get(inflationRate);
  } else {
    const adj = calculateIntervalInflationRate(
      inflationRate,
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
    const intervalInflationRate = getIntervalInflation(
      inflationRate,
      rowContext
    );
    return adjustValueForInflation(value, intervalInflationRate, interval);
  } else {
    return value;
  }
};
adjustForInflation.key = keys.inflation.adjustShadowFn;

functionsDictionary.add(adjustForInflation);

module.exports = adjustForInflation;
