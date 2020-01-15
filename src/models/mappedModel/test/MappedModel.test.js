const { test } = require("tap");
const Model = require("../../model/Model");
const MappedModel = require("../MappedModel");
const testFixture = require("../../test/testFixture");
const { interval } = require("../../../fns/lookupFunctions");

test("MappedModel instanceof Model", t => {
  const model = new MappedModel();
  t.type(model, Model);
  t.end();
});

test("testFixture can return a MappedModel", t => {
  const model = testFixture(MappedModel);
  t.type(model, MappedModel);
  t.end();
});

test("MappedModel: function args without 'reference' key do not cause error", t => {
  const model = testFixture(MappedModel);
  const args = {
    rowKey: "test row",
    fn: interval,
    fnArgs: {
      wibble: "wobble"
    }
  };
  t.doesNotThrow(() => model.addRow(args));
  t.end();
});

test("MappedModel: adding row with existing name errors", t => {
  const rowKey = "test row";
  const args = { rowKey, fn: interval };
  const model = testFixture(MappedModel);
  model.addRow(args);
  t.same(model.row({ rowKey }), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  t.throws(
    () => model.addRow(args),
    new Error("Row 'test row' already exists.")
  );
  t.end();
});
