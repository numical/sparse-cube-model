const { test } = require("tap");
const Model = require("../../model/Model");
const InteractiveModel = require("../InteractiveModel");

test("InteractiveModel instanceof Model", t => {
  const model = new InteractiveModel();
  t.type(model, Model);
  t.end();
});
