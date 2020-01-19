const { test } = require("tap");
const InteractiveModel = require("../InteractiveModel");
const comparableUnserialisedForm = require("./comparableUnserialisedForm");
const testFixture = require("../../test/testFixture");
const { interval } = require("../../../fns/lookupFunctions");
const { defaultScenario } = require("../../model/modelMetadata");

const testMeta = {
  intervals: {
    count: 9
  }
};

test("delete row to blank model can be undone", t => {
  const model = new InteractiveModel(testMeta);
  const historyDescription = "test operation";
  const rowKey = "test row";
  model.addRow({ rowKey, fn: interval });
  const pre = comparableUnserialisedForm({ model });
  model.deleteRow({ rowKey, historyDescription });
  t.same(model.lengths, { x: 0, y: 0, z: 0 });
  model.undo();
  t.same(model.lengths, { x: 10, y: 1, z: 1 });
  const post = comparableUnserialisedForm({ model });
  t.same(post, pre);
  t.end();
});

test("delete row to blank model can be redone", t => {
  const model = new InteractiveModel(testMeta);
  const rowKey = "test row";
  model.addRow({ rowKey, fn: interval });
  model.deleteRow({ rowKey });
  const pre = comparableUnserialisedForm({ model });
  model.undo();
  model.redo();
  t.same(model.lengths, { x: 0, y: 0, z: 0 });
  const post = comparableUnserialisedForm({ model });
  t.same(post, pre);
  t.end();
});

test("delete last row on populated model can be undone", t => {
  const model = testFixture(InteractiveModel);
  const rowKey = "second lookup row";
  const pre = comparableUnserialisedForm({ model });
  model.deleteRow({ rowKey, scenarioKey: defaultScenario });
  t.same(model.lengths, { x: 10, y: 3, z: 1 });
  model.undo();
  t.same(model.lengths, { x: 10, y: 4, z: 1 });
  const post = comparableUnserialisedForm({ model });
  t.same(post, pre);
  t.end();
});

test("delete last row on populated model can be redone", t => {
  const model = testFixture(InteractiveModel);
  const rowKey = "second lookup row";
  model.deleteRow({ rowKey });
  const pre = comparableUnserialisedForm({ model });
  model.undo();
  model.redo();
  t.same(model.lengths, { x: 10, y: 3, z: 1 });
  const post = comparableUnserialisedForm({ model });
  t.same(post, pre);
  t.end();
});

test("delete row (not last) on populated model can be undone", t => {
  const model = testFixture(InteractiveModel);
  const rowKey = "independent row";
  const pre = comparableUnserialisedForm({ model, ignoreIndex: true });
  model.deleteRow({ rowKey });
  t.same(model.lengths, { x: 10, y: 3, z: 1 });
  model.undo();
  t.same(model.lengths, { x: 10, y: 4, z: 1 });
  const post = comparableUnserialisedForm({ model, ignoreIndex: true });
  t.same(post, pre);
  t.end();
});

test("multiple undo/redo of delete row works", t => {
  const model = testFixture(InteractiveModel);
  const rowKey = "independent row";
  model.deleteRow({ rowKey });
  const pre = comparableUnserialisedForm({ model, ignoreIndex: true });
  for (let i = 0; i < 10; i++) {
    model.undo();
    model.redo();
  }
  const post = comparableUnserialisedForm({ model, ignoreIndex: true });
  t.same(post, pre);
  t.end();
});
