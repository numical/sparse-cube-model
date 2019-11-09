const { test, only } = require("tap");
const Model = require("./Model");
const modelMetadata = require("./modelMetadata");
const identity = require("../fns/identity");
const increment = require("../fns/increment");
const sequence = require("./sequence");

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

test("Add row of constants", t => {
  const rowName = "test row";
  const constants = sequence(intervalCount);
  const model = new Model(testDefaults);
  model.addRow({
    rowName,
    constants
  });
  for (let i = 0; i < intervalCount; i++) {
    t.equal(model[i][0][0], constants[i]);
  }
  t.end();
});

test("Add sequence row using zero initial constant", t => {
  const rowName = "test row";
  const model = new Model(testDefaults);
  model.addRow({
    rowName,
    fn: increment,
    constants: [0]
  });
  for (let i = 0; i < intervalCount; i++) {
    t.equal(model[i][0][0], i);
  }
  t.end();
});

test("Add sequence row using custom initial constant", t => {
  const rowName = "test row";
  const initialValue = 505;
  const model = new Model(testDefaults);
  model.addRow({
    rowName,
    fn: increment,
    constants: [initialValue]
  });
  for (let i = 0; i < intervalCount; i++) {
    t.equal(model[i][0][0], i + initialValue);
  }
  t.end();
});

test("Add sequence row using multiple constants", t => {
  const rowName = "test row";
  const model = new Model(testDefaults);
  const constants = new Array(5);
  constants[0] = 3;
  constants[2] = 13;
  constants[4] = 113;
  constants[6] = 0;
  const expected = [3, 4, 13, 14, 113, 114, 0, 1, 2, 3];

  model.addRow({
    rowName,
    fn: increment,
    constants
  });
  for (let i = 0; i < intervalCount; i++) {
    t.equal(model[i][0][0], expected[i]);
  }
  t.end();
});

test("Add row of functions", t => {
  const rowName = "test row";
  const model = new Model(testDefaults);
  model.addRow({
    rowName,
    fn: (model, x) => x
  });
  for (let i = 0; i < intervalCount; i++) {
    t.equal(model[i][0][0], i);
  }
  t.end();
});

test("Add partial row of functions", t => {
  const rowName = "test row";
  const startInterval = 5;
  const endInterval = 7;
  const fn = (model, x) => x;
  const expected = [0, 0, 0, 0, 0, 5, 6, 7, 0, 0];

  const model = new Model(testDefaults);
  model.addRow({
    rowName,
    fn,
    startInterval,
    endInterval
  });

  for (let i = 0; i < intervalCount; i++) {
    t.equal(model[i][0][0], expected[i]);
  }
  t.end();
});

test("Add row with unknown scenario", t => {
  const rowName = "test row";
  const fn = identity(5);
  const scenarioName = "unknown test scenario";
  const args = { rowName, fn, scenarioName };

  const model = new Model(testDefaults);
  t.throws(() => model.addRow(args));
  t.end();
});

test("Add row with existing name", t => {
  const rowName = "test row";
  const fn = identity(7);
  const args = { rowName, fn };

  const model = new Model(testDefaults);
  model.addRow(args);
  t.throws(() => model.addRow(args));
  t.end();
});

test("Add row with no name", t => {
  const fn = identity(7);
  const args = { fn };

  const model = new Model(testDefaults);
  t.throws(() => model.addRow(args));
  t.end();
});
