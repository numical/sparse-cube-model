const { test } = require("tap");
const InteractiveModel = require("../InteractiveModel");
const comparableUnserialisedForm = require("./comparableUnserialisedForm");
const testFixture = require("../../test/testFixture");
const { interval } = require("../../../fns/lookupFunctions");
const { defaultScenario } = require("../../model/internal/modelMetadata");

const testMeta = {
  intervals: {
    count: 10
  }
};

test("delete rows to blank model can be undone", t => {
  const model = new InteractiveModel(testMeta);
  const rowNames = ["test row 1", "test row 2"];
  const historyDescription = "test operation";
  rowNames.forEach(rowName => model.addRow({ rowName, fn: interval }));
  t.same(model.lengths, { x: 10, y: 2, z: 1 });
  const pre = comparableUnserialisedForm({ model });
  model.deleteRows({ rowNames, historyDescription });
  t.same(model.lengths, { x: 0, y: 0, z: 0 });
  model.undo();
  t.same(model.lengths, { x: 10, y: 2, z: 1 });
  const post = comparableUnserialisedForm({ model });
  t.same(post, pre);
  t.end();
});

test("delete rows to blank model can be redone", t => {
  const model = new InteractiveModel(testMeta);
  const rowNames = ["test row 1", "test row 2"];
  rowNames.forEach(rowName => model.addRow({ rowName, fn: interval }));
  t.same(model.lengths, { x: 10, y: 2, z: 1 });
  model.deleteRows({ rowNames, scenarioName: defaultScenario });
  const pre = comparableUnserialisedForm({ model });
  model.undo();
  model.redo();
  t.same(model.lengths, { x: 0, y: 0, z: 0 });
  const post = comparableUnserialisedForm({ model });
  t.same(post, pre);
  t.end();
});

test("delete last rows on populated model can be undone", t => {
  const model = testFixture(InteractiveModel);
  const rowNames = ["independent row", "second lookup row"];
  const pre = comparableUnserialisedForm({ model });
  model.deleteRows({ rowNames });
  t.same(model.lengths, { x: 10, y: 2, z: 1 });
  model.undo();
  t.same(model.lengths, { x: 10, y: 4, z: 1 });
  const post = comparableUnserialisedForm({ model });
  t.same(post, pre);
  t.end();
});

test("delete last rows on populated model can be redone", t => {
  const model = testFixture(InteractiveModel);
  const rowNames = ["independent row", "second lookup row"];
  model.deleteRows({ rowNames });
  const pre = comparableUnserialisedForm({ model });
  model.undo();
  model.redo();
  t.same(model.lengths, { x: 10, y: 2, z: 1 });
  const post = comparableUnserialisedForm({ model });
  t.same(post, pre);
  t.end();
});

test("delete (not last) rows on populated model can be undone", t => {
  const model = testFixture(InteractiveModel);
  const rowNames = ["first lookup row", "second lookup row"];
  const pre = comparableUnserialisedForm({ model, ignoreIndex: true });
  model.deleteRows({ rowNames });
  t.same(model.lengths, { x: 10, y: 2, z: 1 });
  model.undo();
  t.same(model.lengths, { x: 10, y: 4, z: 1 });
  const post = comparableUnserialisedForm({ model, ignoreIndex: true });
  t.same(post, pre);
  t.end();
});

test("delete (not last) rows on populated model can be redone", t => {
  const model = testFixture(InteractiveModel);
  const rowNames = ["first lookup row", "second lookup row"];
  model.deleteRows({ rowNames });
  const pre = comparableUnserialisedForm({ model, ignoreIndex: true });
  model.undo();
  model.redo();
  t.same(model.lengths, { x: 10, y: 2, z: 1 });
  const post = comparableUnserialisedForm({ model, ignoreIndex: true });
  t.same(post, pre);
  t.end();
});

test("delete with dependent rows on populated model can be undone", t => {
  const model = testFixture(InteractiveModel);
  const rowNames = ["increment row", "first lookup row", "second lookup row"];
  const pre = comparableUnserialisedForm({ model, ignoreIndex: true });
  model.deleteRows({ rowNames });
  t.same(model.lengths, { x: 10, y: 1, z: 1 });
  model.undo();
  t.same(model.lengths, { x: 10, y: 4, z: 1 });
  const post = comparableUnserialisedForm({ model, ignoreIndex: true });
  t.same(post, pre);
  t.end();
});

test("delete with dependent rows on populated model can be redone", t => {
  const model = testFixture(InteractiveModel);
  const rowNames = ["increment row", "first lookup row", "second lookup row"];
  model.deleteRows({ rowNames });
  const pre = comparableUnserialisedForm({ model, ignoreIndex: true });
  model.undo();
  model.redo();
  t.same(model.lengths, { x: 10, y: 1, z: 1 });
  const post = comparableUnserialisedForm({ model, ignoreIndex: true });
  t.same(post, pre);
  t.end();
});
