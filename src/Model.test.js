const { test, only } = require("tap");
const Model = require("./Model");
const modelDefaults = require("./modelDefaults");

test("Model default creation", t => {
  const model = new Model();
  t.same(model.meta, modelDefaults());
  t.end();
});

test("Model custom creation", t => {
  const meta = { foo: "bar" };
  const expected = {
    foo: "bar",
    ...modelDefaults()
  };
  const model = new Model(meta);
  t.same(model.meta, expected);
  t.end();
});

test("Add row of constants", t => {
  const model = new Model();
  model.addRow(3, 5);
  t.equal(model[0][0][0], 3);
  for (let i = 1; i < 300; i++) {
    t.equal(model[i][0][0], 5);
  }
  t.end();
});
