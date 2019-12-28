const { test } = require("tap");
const InteractiveModel = require("../InteractiveModel");
const comparableUnserialisedForm = require("./comparableUnserialisedForm");
const testFixture = require("../../test/testFixture");
const { increment, interval, lookup } = require("../../../fns/lookupFunctions");

const testMeta = {
  intervals: {
    count: 10
  }
};

test("delete row to blank model can be undone", t => {
  const model = new InteractiveModel(testMeta);
  const rowName = "test row";
  model.addRow({ rowName, fn: interval });
  const pre = comparableUnserialisedForm({ model });
  model.deleteRow({ rowName });
  t.same(model.lengths, { x: 0, y: 0, z: 0 });
  model.undo();
  t.same(model.lengths, { x: 10, y: 1, z: 1 });
  const post = comparableUnserialisedForm({ model });
  t.same(post, pre);
  t.end();
});

test("delete row to blank model can be redone", t => {
  const model = new InteractiveModel(testMeta);
  const rowName = "test row";
  model.addRow({ rowName, fn: interval });
  model.deleteRow({ rowName });
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
  const rowName = "second lookup row";
  const pre = comparableUnserialisedForm({ model });
  model.deleteRow({ rowName });
  t.same(model.lengths, { x: 10, y: 3, z: 1 });
  model.undo();
  t.same(model.lengths, { x: 10, y: 4, z: 1 });
  const post = comparableUnserialisedForm({ model });
  t.same(post, pre);
  t.end();
});

test("delete last row on populated model can be redone", t => {
  const model = testFixture(InteractiveModel);
  const rowName = "second lookup row";
  model.deleteRow({ rowName });
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
  const rowName = "independent row";
  const pre = comparableUnserialisedForm({ model, ignoreIndex: true });
  model.deleteRow({ rowName });
  t.same(model.lengths, { x: 10, y: 3, z: 1 });
  model.undo();
  t.same(model.lengths, { x: 10, y: 4, z: 1 });
  const post = comparableUnserialisedForm({ model, ignoreIndex: true });
  t.same(post, pre);
  t.end();
});

test("multiple undo/redo of delete row works", t => {
  const model = testFixture(InteractiveModel);
  const rowName = "independent row";
  model.deleteRow({ rowName });
  const pre = comparableUnserialisedForm({ model, ignoreIndex: true });
  for (let i = 0; i < 10; i++) {
    model.undo();
    model.redo();
  }
  const post = comparableUnserialisedForm({ model, ignoreIndex: true });
  t.same(post, pre);
  t.end();
});
