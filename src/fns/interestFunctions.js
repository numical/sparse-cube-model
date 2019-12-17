const { memoizeWith } = require("ramda");
const { intervalsPerYear, lookup, previous } = require("./coreFunctions");
const { add, divide, multiply, power } = require("../maths/coreOperations");

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
  const percent = lookup(...args);
  return add(amount, multiply(amount, divide(percent, 100)));
};
applyInterest.key = "applyInterest";

const applyAnnualisedInterest = (...args) => {
  const amount = previous(...args);
  const annualPercent = lookup(...args);
  const percent = getAnnualisedIntervalMultiplier(annualPercent, ...args);
  return multiply(amount, percent);
};
applyAnnualisedInterest.key = "applyAnnualisedInterest";

const applyAnnualisedCompoundInterest = (...args) => {
  const amount = previous(...args);
  const annualPercent = lookup(...args);
  const percent = getAnnualisedCompoundIntervalMultiplier(
    annualPercent,
    ...args
  );
  return multiply(amount, percent);
};
applyAnnualisedCompoundInterest.key = "applyAnnualisedCompoundInterest";

module.exports = {
  applyInterest,
  applyAnnualisedInterest,
  applyAnnualisedCompoundInterest
};
