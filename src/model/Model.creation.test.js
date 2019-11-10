const { test } = require("tap");
const Model = require("./Model");
const modelMetadata = require("./modelMetadata");

const intervalCount = 10;
const testDefaults = {
  interval: {
    count: intervalCount
  }
};

test("Model default creation", t => {
  const model = new Model();
  t.same(model.meta, modelMetadata());
  t.end();
});

test("Model custom creation", t => {
  const defaults = modelMetadata();
  const expected = {
    ...defaults,
    interval: {
      ...defaults.interval,
      ...testDefaults.interval
    }
  };
  const model = new Model(testDefaults);
  t.same(model.meta, expected);
  t.end();
});
