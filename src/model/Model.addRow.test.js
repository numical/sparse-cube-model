const { test, only } = require("tap");
const Model = require("./Model");
const identity = require("../fns/identity");
const increment = require("../fns/increment");
const interval = require("../fns/interval");
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

test("retrieve added row of constants", t => {
  const rowName = "test row";
  const constants = sequence(intervalCount);
  const model = new Model(testDefaults);
  model.addRow({
    rowName,
    constants
  });
  const row = model.row({ rowName });
  t.same(row, constants);
  t.end();
});

test("retrieve row fails if unknown row name", t => {
  const rowName = "test row";
  const constants = sequence(intervalCount);
  const model = new Model(testDefaults);
  model.addRow({
    rowName,
    constants
  });
  t.throws(() => model.row({ rowName: "unknown row" }));
  t.end();
});

test("retrieve row fails if unknown scenario name", t => {
  const rowName = "test row";
  const constants = sequence(intervalCount);
  const model = new Model(testDefaults);
  model.addRow({
    rowName,
    constants
  });
  t.throws(() => model.row({ rowName, scenarioName: "unknown scenario" }));
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
  const row = model.row({ rowName });
  t.same(row, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  t.end();
});

test("Add sequence row using custom initial constant", t => {
  const rowName = "test row";
  const initialValue = 500;
  const model = new Model(testDefaults);
  model.addRow({
    rowName,
    fn: increment,
    constants: [initialValue]
  });
  const row = model.row({ rowName });
  t.same(row, [500, 501, 502, 503, 504, 505, 506, 507, 508, 509]);
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
  model.addRow({
    rowName,
    fn: increment,
    constants
  });
  const row = model.row({ rowName });
  t.same(row, [3, 4, 13, 14, 113, 114, 0, 1, 2, 3]);
  t.end();
});

test("Add row of functions", t => {
  const rowName = "test row";
  const model = new Model(testDefaults);
  model.addRow({
    rowName,
    fn: interval
  });
  const row = model.row({ rowName });
  t.same(row, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  t.end();
});

test("Add partial row of functions", t => {
  const rowName = "test row";
  const startInterval = 5;
  const endInterval = 7;
  const fn = interval;
  const model = new Model(testDefaults);
  model.addRow({
    rowName,
    fn,
    startInterval,
    endInterval
  });
  const row = model.row({ rowName });
  t.same(row, [0, 0, 0, 0, 0, 5, 6, 7, 0, 0]);
  t.end();
});

test("Add multiple rows", t => {
  const numRows = 3;
  const model = new Model(testDefaults);
  const rowNames = ["row 0", "row 1", "row2"];
  rowNames.forEach(rowName => {
    model.addRow({
      rowName,
      fn: increment,
      constants: [0]
    });
  });
  rowNames.forEach(rowName => {
    const row = model.row({ rowName });
    t.same(row, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
  t.end();
});
