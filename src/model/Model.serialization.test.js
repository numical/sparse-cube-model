const { test } = require("tap");
const Model = require("./Model");
const testFixture = require("./testFixture");

test("Blank model toString does not error", t => {
  const model = new Model();
  t.doesNotThrow(() => model.toString());
  t.end();
});
