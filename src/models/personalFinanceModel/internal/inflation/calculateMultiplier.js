const functionsDictionary = require("../../../../fns/functionsDictionary");
const {
  lookup,
  previous,
  intervalsPerYear
} = require("../../../../fns/lookupFunctions");
const {
  calculateIntervalInflationRate,
  adjustValueForInflation
} = require("../../../../maths/percentageOperations");
const keys = require("../keys");

const cache = new Map();

const getIntervalInflation = (rowContext, interval) => {
  const inflationRate = lookup(rowContext, interval);
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

const calculateMultiplier = (rowContext, interval) => {
  if (interval === 0) {
    return 1;
  } else {
    const inflationRate = lookup(rowContext, interval);
    return adjustValueForInflation(
      previous(rowContext, interval),
      getIntervalInflation(rowContext, interval)
    );
  }
};
calculateMultiplier.key = keys.inflation.fn.calculateMultiplier;

functionsDictionary.add(calculateMultiplier);

module.exports = calculateMultiplier;
