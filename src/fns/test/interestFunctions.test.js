const { test } = require("tap");
const td = require("testdouble");

const interestTestCases = [
  [100, 5, 105],
  [10, 5, 10.5],
  [1000, 3.5, 1035],
  [1234.56, 3.05, 1272.21408]
];

const annualisedTestCases = [
  [100, 60, 105],
  [100, 12, 101],
  [1234.56, 3.05, 1237.69784]
];

const annualisedCompoundTestCases = [
  [100, 60, 103.99441076905043],
  [100, 12, 100.9488792934583],
  [1234.56, 3.05, 1237.6548117919046]
];

const monthIntervalArgs = {
  intervals: {
    duration: "month"
  }
};

const yearIntervalArgs = {
  intervals: {
    duration: "year"
  }
};

try {
  const coreFunctions = td.replace("../coreFunctions");
  const { lookup, previous, intervalsPerYear } = coreFunctions;
  const anything = td.matchers.anything();
  const {
    applyInterest,
    applyAnnualisedInterest,
    applyAnnualisedCompoundInterest
  } = require("../interestFunctions");

  interestTestCases.forEach(([amount, percent, expected]) => {
    test(`applyInterest: expect ${amount} * ${percent}% to be ${expected}`, t => {
      td.when(previous(anything)).thenReturn(amount);
      td.when(lookup(anything)).thenReturn(percent);
      td.when(intervalsPerYear(anything)).thenReturn(12);
      t.same(expected, applyInterest(monthIntervalArgs));
      t.end();
    });
  });

  annualisedTestCases.forEach(([amount, percent, expected]) => {
    test(`applyAnnualisedInterest: expect ${amount} * an annualised ${percent}% to be ${expected} after one month`, t => {
      td.when(previous(anything)).thenReturn(amount);
      td.when(lookup(anything)).thenReturn(percent);
      td.when(intervalsPerYear(anything)).thenReturn(12);
      t.same(applyAnnualisedInterest(monthIntervalArgs), expected);
      t.end();
    });
  });

  interestTestCases.forEach(([amount, percent, expected]) => {
    test(`applyAnnualisedInterest: expect ${amount} * an annual ${percent}% to be ${expected}`, t => {
      td.when(previous(anything)).thenReturn(amount);
      td.when(lookup(anything)).thenReturn(percent);
      td.when(intervalsPerYear(anything)).thenReturn(1);
      t.same(applyAnnualisedInterest(yearIntervalArgs), expected);
      t.end();
    });
  });

  annualisedCompoundTestCases.forEach(([amount, percent, expected]) => {
    test(`applyAnnualisedCompoundInterest: expect ${amount} * a compound annualised ${percent}% to be ${expected} after one month`, t => {
      td.when(previous(anything)).thenReturn(amount);
      td.when(lookup(anything)).thenReturn(percent);
      td.when(intervalsPerYear(anything)).thenReturn(12);
      t.same(applyAnnualisedCompoundInterest(monthIntervalArgs), expected);
      t.end();
    });
  });

  interestTestCases.forEach(([amount, percent, expected]) => {
    test(`applyAnnualisedCompoundInterest: expect ${amount} * an annual ${percent}% to be ${expected}`, t => {
      td.when(previous(anything)).thenReturn(amount);
      td.when(lookup(anything)).thenReturn(percent);
      td.when(intervalsPerYear(anything)).thenReturn(1);
      t.same(applyAnnualisedCompoundInterest(yearIntervalArgs), expected);
      t.end();
    });
  });
} finally {
  td.reset();
}
