const { test } = require("tap");
const modelMetadata = require("../modelMetadata");

test("Default metadata", t => {
  const meta = modelMetadata();
  t.same(meta, modelMetadata.defaults);
  t.end();
});

test("Merge customer metadata", t => {
  const testDefaults = {
    intervals: {
      count: 10
    }
  };
  const meta = modelMetadata(testDefaults);
  const expected = {
    ...modelMetadata.defaults,
    intervals: {
      ...modelMetadata.defaults.intervals,
      ...testDefaults.intervals
    }
  };
  t.same(meta, expected);
  t.end();
});
