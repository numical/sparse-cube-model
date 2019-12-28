const { test } = require("tap");
const Model = require("../../model/Model");
const InteractiveModel = require("../InteractiveModel");
const testFixture = require("../../test/testFixture");

test("InteractiveModel instanceof Model", t => {
  const model = new InteractiveModel();
  t.type(model, Model);
  t.end();
});

test("testFixture can return a InteractiveModel", t => {
  const model = testFixture(InteractiveModel);
  t.type(model, InteractiveModel);
  t.end();
});
