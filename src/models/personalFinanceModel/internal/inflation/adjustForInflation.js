const functionsDictionary = require("../../../../fns/functionsDictionary");
const keys = require("../keys");
const { add, divide, power } = require("../../../../maths/coreOperations");
const { lookup } = require("../../../../fns/lookupFunctions");

const cache = new Map();

const annualInflationAdjustment = (rate, rowContext) => {
  if (cache.has(rate)) {
    return cache.get(rate);
  } else {
    const adj = divide(add(1, divide(rate, 100)), intervalsPerYear(rowContext));
    cache.put(rate, adj);
    return adj;
  }
};

const adjustForInflation = (rowContext, interval, value) => {
  const { fnArgs } = rowContext;
  const { rateRowKey } = fnArgs;
  const rate = lookup(
    { dependsOn: { lookup: keys.inflation.row }, ...rowContext },
    interval
  );
  return divide(
    value,
    power(annualInflationAdjustment(rate, rowContext), interval)
  );
};
adjustForInflation.key = keys.inflation.adjustShadowFn;

functionsDictionary.add(adjustForInflation);

module.exports = adjustForInflation;
