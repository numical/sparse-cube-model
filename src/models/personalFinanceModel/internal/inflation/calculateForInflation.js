const { add, divide, power } = require("../../../../maths/coreOperations");

const calculateIntervalInflationRate = (annualInflationRate, intervalsPerYear) => {
    if (annualInflationRate === 0) {
        return 0;
    } else {
        return divide(annualInflationRate, intervalsPerYear);
    }
};

const adjustValueForInflation = (value, intervalInflationRate, numIntervals) => {
    if (intervalInflationRate ===  0) {
        return value;
    } else {
        return divide(
            value,
            power(intervalInflationRate, numIntervals)
        );
    }
};

module.exports = {
    calculateIntervalInflationRate,
    adjustValueForInflation
};
