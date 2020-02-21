const { add, divide, multiply, power, subtract } = require("./coreOperations");

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
  numIntervals
) => {
  if (intervalInflationRate === 0) {
    return value;
  } else {
    return divide(
      value,
      power(add(1, divide(intervalInflationRate, 100)), numIntervals)
    );
  }
};

module.exports = {
  calculateIntervalInflationRate,
  adjustValueForInflation
};
