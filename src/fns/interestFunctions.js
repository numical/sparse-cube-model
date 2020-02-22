const { memoizeWith } = require("ramda");
const { intervalsPerYear, lookup, previous } = require("./lookupFunctions");
const {
  add,
  divide,
  multiply,
  subtract,
  power
} = require("../maths/arithmeticOperations");

const getDependency = (key, isMandatory, rowContext, interval) => {
  if (rowContext.dependsOn && rowContext.dependsOn[key]) {
    return lookup(
      { ...rowContext, dependsOn: { lookup: rowContext.dependsOn[key] } },
      interval
    );
  } else if (isMandatory) {
    throw new Error(`Missing '${key}' dependsOn value.`);
  } else {
    return 0;
  }
};

const getInterest = getDependency.bind(null, "interest", true);

const getIncrement = getDependency.bind(null, "increment", false);

const getDecrement = getDependency.bind(null, "decrement", false);

const cacheKey = (annualPercent, { intervals }) =>
  String(annualPercent) + intervals.duration;

const getAnnualisedIntervalMultiplier = memoizeWith(
  cacheKey,
  (annualPercent, ...args) =>
    add(divide(annualPercent, multiply(intervalsPerYear(...args), 100)), 1)
);

// https://money.stackexchange.com/questions/51728/converting-annual-interest-rate-to-monthly-when-compounding-frequency-known
// FV = P * (1 + (r/100))^ n
// Where:- FV = Future Value P = Principal R = Rate of interest n = time.
const getAnnualisedCompoundIntervalMultiplier = memoizeWith(
  cacheKey,
  (annualPercent, ...args) =>
    power(
      add(1, divide(annualPercent, 100)),
      divide(1, intervalsPerYear(...args))
    )
);

const applyInterest = (...args) => {
  const amount = previous(...args);
  const percent = getInterest(...args);
  const increment = getIncrement(...args);
  const decrement = getDecrement(...args);
  const total = subtract(add(amount, increment), decrement);
  return add(total, multiply(total, divide(percent, 100)));
};
applyInterest.key = "applyInterest";

const applyAnnualisedInterest = (...args) => {
  const amount = previous(...args);
  const annualPercent = getInterest(...args);
  const percent = getAnnualisedIntervalMultiplier(annualPercent, ...args);
  const increment = getIncrement(...args);
  const decrement = getDecrement(...args);
  const total = subtract(add(amount, increment), decrement);
  return multiply(total, percent);
};
applyAnnualisedInterest.key = "applyAnnualisedInterest";

const applyAnnualisedCompoundInterest = (...args) => {
  const amount = previous(...args);
  const annualPercent = getInterest(...args);
  const percent = getAnnualisedCompoundIntervalMultiplier(
    annualPercent,
    ...args
  );
  const increment = getIncrement(...args);
  const decrement = getDecrement(...args);
  const total = subtract(add(amount, increment), decrement);
  return multiply(total, percent);
};
applyAnnualisedCompoundInterest.key = "applyAnnualisedCompoundInterest";

module.exports = {
  applyInterest,
  applyAnnualisedInterest,
  applyAnnualisedCompoundInterest
};
