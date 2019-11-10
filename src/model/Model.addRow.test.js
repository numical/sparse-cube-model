const { test, only } = require("tap");
const Model = require("./Model");
const identity = require("../fns/identity");
const increment = require("../fns/increment");
const sequence = require("./sequence");

const intervalCount = 10;
const testDefaults = {
  interval: {
    count: intervalCount
  }
};

test("Add row with unknown scenario throws error", t => {
  const rowName = "test row";
  const fn = identity(5);
  const scenarioName = "unknown test scenario";
  const args = { rowName, fn, scenarioName };

  const model = new Model(testDefaults);
  t.throws(() => model.addRow(args));
  t.end();
});

test("Add row with existing name throws error", t => {
  const rowName = "test row";
  const fn = identity(7);
  const args = { rowName, fn };

  const model = new Model(testDefaults);
  model.addRow(args);
  t.throws(() => model.addRow(args));
  t.end();
});

test("Add row with no name throws error", t => {
  const fn = identity(7);
  const args = { fn };

  const model = new Model(testDefaults);
  t.throws(() => model.addRow(args));
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

test("Add multiple rows", t => {
  const numRows = 3;
  const model = new Model(testDefaults);
  for (let rowNum = 0; rowNum < numRows; rowNum++) {
    model.addRow({
      rowName: `row num ${rowNum}`,
      fn: increment,
      constants: [0]
    });
  }
  for (let rowNum = 0; rowNum < numRows; rowNum++) {
    for (let i = 0; i < intervalCount; i++) {
      t.equal(model[i][rowNum][0], i);
    }
  }
  t.end();
});
