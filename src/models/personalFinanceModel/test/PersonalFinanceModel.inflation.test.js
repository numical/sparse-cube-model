const { test } = require("tap");
const PersonalFinanceModel = require("../PersonalFinanceModel");
const keys = require("../internal/keys");
const { defaultScenario } = require("../../model/modelMetadata");
const { zeroes, ones } = require("./threeHundredAndOne");
const { previous } = require("../../../fns/lookupFunctions");
const adjustForInflation = require("../internal/inflation/adjustForInflation");
const inflationAdjustedScenarioKey = require("../internal/inflation/inflationAdjustedScenarioKey");

test("Creates inflation rows with default values", t => {
  const model = new PersonalFinanceModel();
  model.setInflation();
  t.same(model.row({ rowKey: keys.inflation.row.rate }), zeroes);
  t.same(model.row({ rowKey: keys.inflation.row.multiplier }), ones);
  t.end();
});

test("Creates inflation rows with zero values", t => {
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

test("Updates an existing inflation rate", t => {
  const model = new PersonalFinanceModel();
  model.setInflation(0);
  t.same(model.row({ rowKey: keys.inflation.row.rate }), zeroes);
  model.setInflation(1);
  t.same(model.row({ rowKey: keys.inflation.row.rate }), ones);
  t.end();
});

test("Row with adjust for inflation args is affected by inflation", t => {
  const count = 5;
  const model = new PersonalFinanceModel({ intervals: { count } });
  const rowKey = "testRow";
  model.addRow(
    adjustForInflation({
      rowKey,
      fn: previous,
      constants: [1000]
    })
  );
  t.same(model.row({ rowKey }), [1000, 1000, 1000, 1000, 1000, 1000]);
  model.setInflation(10);
  t.same(model.row({ rowKey, scenarioKey: inflationAdjustedScenarioKey() }), [
    1000,
    992.0889434469909,
    984.2404717097668,
    976.4540896763106,
    968.7293061514642,
    961.0656338259428
  ]);
  t.end();
});
