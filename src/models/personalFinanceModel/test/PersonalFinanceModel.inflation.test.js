const { test } = require("tap");
const PersonalFinanceModel = require("../PersonalFinanceModel");
const keys = require("../internal/keys");
const { defaultScenario } = require("../../model/modelMetadata");
const { zeroes, ones } = require("./threeHundredAndOne");

test("Creates inflation rows with default values", t => {
  const model = new PersonalFinanceModel();
  model.setInflation(0);
  t.same(model.row({ rowKey: keys.inflation.row.rate }), zeroes);
  t.same(model.row({ rowKey: keys.inflation.row.multiplier }), ones);
  t.end();
});

test("Creates an inflation adjusted shadow scenario", t => {
  const model = new PersonalFinanceModel();
  model.setInflation(0);
  t.same(model.lengths, { x: 301, y: 2, z: 2 });
  const shadow = model.scenario({
    scenarioKey: `${defaultScenario}_${keys.inflation.scenario.suffix}`
  });
  t.same(shadow, [zeroes, ones]);
  t.end();
});
