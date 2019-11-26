const { test, only } = require("tap");
const Model = require("../Model");
const MappedModel = require("../MappedModel");
const testFixture = require("./testFixture");

test("MappedModel instanceof Model", t => {
  const model = new MappedModel();
  t.type(model, Model);
  t.end();
});

test("testFixture can return a MappedModel", t => {
  const { model } = testFixture(MappedModel);
  t.type(model, MappedModel);
  t.end();
});
