const { test } = require("tap");
const addAssertions = require("../../models/test/addAssertions");
const {
  calculateIntervalInflationRate,
  adjustValueForInflation,
  applyInterest
} = require("../percentageOperations");

const monthlyRates = new Map(); // { annualInflation: monthly inflation }
monthlyRates.set(2, 0.16515813019202241);
monthlyRates.set(5, 0.40741237836483535);
monthlyRates.set(50, 3.436608313191658);
monthlyRates.set(100, +5.946309435929531);

const annualInflation = new Map(); // annualInflation: adjustedValue
annualInflation.set(100, 500);
annualInflation.set(50, 666.6666666666666);
annualInflation.set(5, 952.3809523809523);
annualInflation.set(2, 980.3921568627451);

const annualInterest = new Map(); // annualInflation: adjustedValue
annualInterest.set(100, 2000);
annualInterest.set(50, 1500);
annualInterest.set(5, 1050);
annualInterest.set(2, 1020);

test("calculateIntervalInflationRate", t => {
  t.test("zero inflation always return zero", t => {
    t.equal(calculateIntervalInflationRate(0, 1), 0);
    t.equal(calculateIntervalInflationRate(0, 12), 0);
    t.equal(calculateIntervalInflationRate(0, 52), 0);
    t.end();
  });
  t.test("yearly interval always returns annual inflation rate", t => {
    t.equal(calculateIntervalInflationRate(0, 1), 0);
    t.equal(calculateIntervalInflationRate(10, 1), 10);
    t.equal(calculateIntervalInflationRate(100, 1), 100);
    t.end();
  });
  t.test("calculate monthly inflation rates", t => {
    monthlyRates.forEach((intervalInflationRate, annualInflationRate) => {
      /*
        To check the map values:
        t.equal(
          Math.pow(1 + intervalInflationRate / 100, 12),
          1 + annualInflationRate / 100
        );
        */
      t.equal(
        calculateIntervalInflationRate(annualInflationRate, 12),
        intervalInflationRate
      );
    });
    t.end();
  });
  t.end();
});

test("adjustValueForInflation", t => {
  t.test("zero inflation always returns initial value", t => {
    t.equal(adjustValueForInflation(1000, 0, 0), 1000);
    t.equal(adjustValueForInflation(1000, 0, 10), 1000);
    t.equal(adjustValueForInflation(1000, 0, 100), 1000);
    t.end();
  });
  t.test("single interval calculations", t => {
    annualInflation.forEach((expectedValue, intervalInflationRate) => {
      t.equal(
        adjustValueForInflation(1000, intervalInflationRate),
        expectedValue
      );
    });
    t.end();
  });
  t.test("multiple intervals calculations - 12 months", t => {
    addAssertions(t);
    annualInflation.forEach((expectedValue, annualInflationRate) => {
      const intervalInflationRate = monthlyRates.get(annualInflationRate);
      t.equalToNearestPenny(
        // rounding errors come into play now
        adjustValueForInflation(1000, intervalInflationRate, 12),
        expectedValue
      );
    });
    t.end();
  });
  t.end();
});

test("applyInterest", t => {
  t.test("zero rate always returns initial value", t => {
    t.equal(applyInterest(1000, 0, 0), 1000);
    t.equal(applyInterest(1000, 0, 10), 1000);
    t.equal(applyInterest(1000, 0, 100), 1000);
    t.end();
  });
  t.test("single interval calculations", t => {
    annualInterest.forEach((expectedValue, intervalInterestRate) => {
      t.equal(applyInterest(1000, intervalInterestRate), expectedValue);
    });
    t.end();
  });
  t.test("multiple intervals calculations - 12 months", t => {
    addAssertions(t);
    annualInterest.forEach((expectedValue, annualInterestRate) => {
      const intervalInterestRate = monthlyRates.get(annualInterestRate);
      t.equalToNearestPenny(
        // rounding errors come into play now
        applyInterest(1000, intervalInterestRate, 12),
        expectedValue
      );
    });
    t.end();
  });
  t.end();
});
