const { test } = require("tap");
const { calculateIntervalInflationRate, adjustValueForInflation } = require('../calculateForInflation');

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
    t.end();
});

test("adjustValueForInflation", t => {
    t.test("zero inflation always returns initial value", t => {
        t.equal(adjustValueForInflation(1000,0, 0), 1000);
        t.equal(adjustValueForInflation(1000, 0, 10), 1000);
        t.equal(adjustValueForInflation(1000, 0, 100), 1000);
        t.end();
    });
    t.end();
});
