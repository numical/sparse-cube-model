const { test, only } = require("tap");
const Model = require("./Model");
const modelDefaults = require("./modelDefaults");
const identity = require("../fns/identity");

const numTestIntervals = 10;
const testDefaults = {
  interval: {
    number: numTestIntervals
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
  const model = new Model(testDefaults);
  const initialValue = 3;
  const subsequentValues = 5;
  model.addRow({
    initialValue,
    subsequentValues
  });
  t.equal(model[0][0][0], initialValue);
  for (let i = 1; i < numTestIntervals; i++) {
    t.equal(model[i][0][0], subsequentValues);
  }
  t.end();
});

test("Add row of functions", t => {
  const model = new Model(testDefaults);
  const initialValue = 7;
  const subsequentValues = identity(9);
  model.addRow({
    initialValue,
    subsequentValues
  });
  t.equal(model[0][0][0], 7);
  for (let i = 1; i < numTestIntervals; i++) {
    t.equal(model[i][0][0], 9);
  }
  t.end();
});

test("Add partial row of functions", t => {
  const model = new Model(testDefaults);
  const initialInterval = 5;
  const initialValue = 11;
  const subsequentValues = identity(13);
  model.addRow({
    initialValue,
    subsequentValues,
    initialInterval
  });
  for (let i = 1; i < initialInterval; i++) {
    t.equal(model[i][0][0], 0);
  }
  t.equal(model[initialInterval][0][0], 11);
  for (let i = initialInterval + 1; i < numTestIntervals; i++) {
    t.equal(model[i][0][0], 13);
  }
  t.end();
});

test("Add row with invalid value", t => {
  const model = new Model(testDefaults);
  const initialValue = {};
  const subsequentValues = 13;
  const args = { initialValue, subsequentValues };
  t.throws(() => model.addRow(args));
  t.end();
});

test("Add row with unknown scenario", t => {
  const model = new Model(testDefaults);
  const initialValue = 15;
  const subsequentValues = 17;
  const scenario = "unknown test scenario";
  const args = { initialValue, subsequentValues, scenario };
  t.throws(() => model.addRow(args));
  t.end();
});
