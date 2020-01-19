const { test } = require("tap");
const PersonalFinanceModel = require("../PersonalFinanceModel");
const keys = require("../internal/keys");
const { defaults } = require("../../model/modelMetadata");

const threeHundredAndOneZeros = Array(defaults.intervals.count + 1).fill(0);

test("Creates an inflationRow row", t => {
  const model = new PersonalFinanceModel();
  const inflationValues = model.row({ rowKey: keys.inflationRow });
  t.same(inflationValues, threeHundredAndOneZeros);
  t.end();
});

test("Creates an inflation adjusted shadow scenario", t => {
  const model = new PersonalFinanceModel();
  const shadow = model.scenario({
    scenarioKey: "defaultScenario_inflationAdjusted"
  });
  t.same(shadow, [threeHundredAndOneZeros]);
  t.end();
});

test("Can add savings account", t => {
  const model = new PersonalFinanceModel();
  model.addSavings();
  t.end();
});
