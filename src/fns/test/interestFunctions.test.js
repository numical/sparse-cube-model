const { test } = require("tap");
const td = require("testdouble");

const noIncrementTestCases = [
  [100, 5, 105],
  [60, 5, 63],
  [10, 5, 10.5],
  [1000, 3.05, 1030.5]
];

const interestTestCases = [
  [100, 5, 0, 105],
  [60, 5, 40, 105],
  [10, 5, 0, 10.5],
  [1000, 3.5, 0, 1035],
  [1234.56, 3.05, 0, 1272.21408],
  [1000, 3.05, 234.56, 1272.21408]
];

const annualisedTestCases = [
  [100, 60, 0, 105],
  [60, 60, 40, 105],
  [100, 12, 0, 101],
  [1234.56, 3.05, 0, 1237.69784],
  [1000, 3.05, 234.56, 1237.69784]
];

const annualisedCompoundTestCases = [
  [100, 60, 0, 103.99441076905043],
  [60, 60, 40, 103.99441076905043],
  [100, 12, 0, 100.9488792934583],
  [1234.56, 3.05, 0, 1237.6548117919046],
  [1000, 3.05, 234.56, 1237.6548117919046]
];

const monthIntervalArgs = {
  intervals: {
    duration: "month"
  },
  dependsOn: ""
};

const monthIntervalWithIncrementArgs = {
  intervals: {
    duration: "month"
  },
  dependsOn: []
};

const yearIntervalWithIncrementArgs = {
  intervals: {
    duration: "year"
  },
  dependsOn: []
};

const interval = 1;

try {
  const coreFunctions = td.replace("../coreFunctions");
  const { lookup, previous, intervalsPerYear } = coreFunctions;
  const anything = td.matchers.anything();
  const {
    applyInterest,
    applyAnnualisedInterest,
    applyAnnualisedCompoundInterest
  } = require("../interestFunctions");

  noIncrementTestCases.forEach(([amount, percent, expected]) => {
    test(`applyInterest: expect ${amount} * ${percent}% to be ${expected}`, t => {
      td.when(previous(anything, interval)).thenReturn(amount);
      td.when(lookup(anything, interval)).thenReturn(percent);
      td.when(intervalsPerYear(anything, interval)).thenReturn(12);
      t.same(applyInterest(monthIntervalArgs, interval), expected);
      t.end();
    });
  });

  interestTestCases.forEach(([amount, percent, increment, expected]) => {
    test(`applyInterest: expect ${increment} + ${amount} * ${percent}% to be ${expected}`, t => {
      td.when(previous(anything, interval)).thenReturn(amount);
      td.when(lookup(anything, interval)).thenReturn(percent, increment);
      td.when(intervalsPerYear(anything, interval)).thenReturn(12);
      t.same(applyInterest(monthIntervalWithIncrementArgs, interval), expected);
      t.end();
    });
  });

  annualisedTestCases.forEach(([amount, percent, increment, expected]) => {
    test(`applyAnnualisedInterest: expect ${increment} + ${amount} * an annualised ${percent}% to be ${expected} after one month`, t => {
      td.when(previous(anything, interval)).thenReturn(amount);
      td.when(lookup(anything, interval)).thenReturn(percent, increment);
      td.when(intervalsPerYear(anything, interval)).thenReturn(12);
      t.same(
        applyAnnualisedInterest(monthIntervalWithIncrementArgs, interval),
        expected
      );
      t.end();
    });
  });

  interestTestCases.forEach(([amount, percent, increment, expected]) => {
    test(`applyAnnualisedInterest: expect ${increment} + ${amount} * an annual ${percent}% to be ${expected}`, t => {
      td.when(previous(anything, interval)).thenReturn(amount);
      td.when(lookup(anything, interval)).thenReturn(percent, increment);
      td.when(intervalsPerYear(anything, interval)).thenReturn(1);
      t.same(
        applyAnnualisedInterest(yearIntervalWithIncrementArgs, interval),
        expected
      );
      t.end();
    });
  });

  annualisedCompoundTestCases.forEach(
    ([amount, percent, increment, expected]) => {
      test(`applyAnnualisedCompoundInterest: expect ${increment} + ${amount} * a compound annualised ${percent}% to be ${expected} after one month`, t => {
        td.when(previous(anything, interval)).thenReturn(amount);
        td.when(lookup(anything, interval)).thenReturn(percent, increment);
        td.when(intervalsPerYear(anything, interval)).thenReturn(12);
        t.same(
          applyAnnualisedCompoundInterest(
            monthIntervalWithIncrementArgs,
            interval
          ),
          expected
        );
        t.end();
      });
    }
  );

  interestTestCases.forEach(([amount, percent, increment, expected]) => {
    test(`applyAnnualisedCompoundInterest: expect ${increment} + ${amount} * an annual ${percent}% to be ${expected}`, t => {
      td.when(previous(anything, interval)).thenReturn(amount);
      td.when(lookup(anything, interval)).thenReturn(percent, increment);
      td.when(intervalsPerYear(anything, interval)).thenReturn(1);
      t.same(
        applyAnnualisedCompoundInterest(
          yearIntervalWithIncrementArgs,
          interval
        ),
        expected
      );
      t.end();
    });
  });
} finally {
  td.reset();
}
