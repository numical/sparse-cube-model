const {
  add,
  divide,
  multiply,
  power,
  subtract
} = require("./arithmeticOperations");

/*
 1.02 = (1 + x)^12
 1.02^(1/12) - 1 = x
 */
const calculateIntervalInflationRate = (
  annualInflationRate,
  intervalsPerYear
) => {
  if (annualInflationRate === 0) {
    return 0;
  } else if (intervalsPerYear === 1) {
    return annualInflationRate;
  } else {
    /*
     1.02 = (1 + x)^12
     1.02^(1/12) - 1 = x
     */
    return multiply(
      subtract(
        power(
          add(1, divide(annualInflationRate, 100)),
          divide(1, intervalsPerYear)
        ),
        1
      ),
      100
    );
  }
};

const adjustValueForInflation = (
  value,
  intervalInflationRate,
  numIntervals = 1
) => {
  if (intervalInflationRate === 0) {
    return value;
  } else if (numIntervals === 1) {
    return divide(value, add(1, divide(intervalInflationRate, 100)));
  } else {
    return divide(
      value,
      power(add(1, divide(intervalInflationRate, 100)), numIntervals)
    );
  }
};

const applyInterest = (value, intervalInterestRate, numIntervals = 1) => {
  if (intervalInterestRate === 0) {
    return value;
  } else if (numIntervals === 1) {
    return multiply(value, add(1, divide(intervalInterestRate, 100)));
  } else {
    return multiply(
      value,
      power(add(1, divide(intervalInterestRate, 100)), numIntervals)
    );
  }
};

module.exports = {
  calculateIntervalInflationRate,
  calculateIntervalInterestRate: calculateIntervalInflationRate,
  adjustValueForInflation,
  applyInterest
};
