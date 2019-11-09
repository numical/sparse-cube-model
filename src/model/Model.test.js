const { test, only } = require("tap");
const Model = require("./Model");
const modelDefaults = require("./modelDefaults");
const identity = require("../fns/identity");

const intervalCount = 10;
const testDefaults = {
  interval: {
    count: intervalCount
  }
};

test("Model default creation", t => {
  const model = new Model();
  t.same(model.meta, modelDefaults());
  t.end();
});

test("Model custom creation", t => {
  const defaults = modelDefaults();
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

test("Add row of constants", t => {
  const rowName = "test row";
  const initialValue = 3;
  const subsequentValues = 5;

  const model = new Model(testDefaults);
  model.addRow({
    rowName,
    initialValue,
    subsequentValues
  });
  t.equal(model[0][0][0], initialValue);
  for (let i = 1; i < intervalCount; i++) {
    t.equal(model[i][0][0], subsequentValues);
  }
  t.end();
});

test("Add row of functions", t => {
  const rowName = "test row";
  const initialValue = 7;
  const subsequentValues = identity(9);

  const model = new Model(testDefaults);
  model.addRow({
    rowName,
    initialValue,
    subsequentValues
  });
  t.equal(model[0][0][0], 7);
  for (let i = 1; i < intervalCount; i++) {
    t.equal(model[i][0][0], 9);
  }
  t.end();
});

test("Add partial row of functions", t => {
  const rowName = "test row";
  const initialInterval = 5;
  const initialValue = 11;
  const subsequentValues = identity(13);

  const model = new Model(testDefaults);
  model.addRow({
    rowName,
    initialValue,
    subsequentValues,
    initialInterval
  });
  for (let i = 1; i < initialInterval; i++) {
    t.equal(model[i][0][0], 0);
  }
  t.equal(model[initialInterval][0][0], 11);
  for (let i = initialInterval + 1; i < intervalCount; i++) {
    t.equal(model[i][0][0], 13);
  }
  t.end();
});

test("Add row with unknown scenario", t => {
  const rowName = "test row";
  const initialValue = 15;
  const subsequentValues = 17;
  const scenarioName = "unknown test scenario";
  const args = { rowName, initialValue, subsequentValues, scenarioName };

  const model = new Model(testDefaults);
  t.throws(() => model.addRow(args));
  t.end();
});

test("Add row with existing name", t => {
  const rowName = "test row";
  const initialValue = 15;
  const subsequentValues = 17;
  const args = { rowName, initialValue, subsequentValues };

  const model = new Model(testDefaults);
  model.addRow(args);
  t.throws(() => model.addRow(args));
  t.end();
});

test("Add row with invalid value", t => {
  const rowName = "test row";
  const initialValue = {};
  const subsequentValues = 13;
  const args = { rowName, initialValue, subsequentValues };

  const model = new Model(testDefaults);
  t.throws(() => model.addRow(args));
  t.end();
});
