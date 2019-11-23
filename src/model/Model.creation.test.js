const { test } = require("tap");
const Model = require("./Model");
const modelMetadata = require("./modelMetadata");

const count = 10;
const testDefaults = {
  intervals: {
    count
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
    intervals: {
      ...defaults.intervals,
      ...testDefaults.intervals
    }
  };
  const model = new Model(testDefaults);
  t.same(model.meta, expected);
  t.end();
});
