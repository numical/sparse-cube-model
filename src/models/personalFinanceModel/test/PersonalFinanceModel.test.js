const { test } = require("tap");
const PersonalFinanceModel = require("../PersonalFinanceModel");
const keys = require("../internal/keys");
const { defaults } = require("../../model/modelMetadata");

const threeHundredAndOneZeros = Array(defaults.intervals.count + 1).fill(0);

/*
test("Creates an inflationRow row", t => {
  const model = new PersonalFinanceModel();
  const inflationValues = model.row({ rowKey: keys.inflation.row });
  t.same(inflationValues, threeHundredAndOneZeros);
  t.end();
});

test("Creates an inflation adjusted shadow scenario", t => {
  const model = new PersonalFinanceModel();
  const shadow = model.scenario({
    scenarioKey: "defaultScenario_pfm.inflationAdjusted"
  });
  t.same(shadow, [threeHundredAndOneZeros]);
  t.end();
});
*/

test("Savings account must have a name", t => {
  const model = new PersonalFinanceModel();
  t.throws(() => model.addSavings(), new Error("Savings must have a name."));
  t.end();
});

test("Savings account must have a start date", t => {
  const model = new PersonalFinanceModel();
  t.throws(
    () => model.addSavings({ name: "test" }),
    new Error("Savings must have a start date.")
  );
  t.end();
});
