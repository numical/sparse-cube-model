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

test("Function args without 'reference' key do not cause error", t => {
  const model = testFixture(MappedModel);
  const args = {
    rowName: "test row",
    fn: interval,
    fnArgs: {
      wibble: "wobble"
    }
  };
  t.doesNotThrow(() => model.addRow(args));
  t.end();
});
