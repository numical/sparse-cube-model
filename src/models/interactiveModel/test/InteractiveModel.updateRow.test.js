const { test } = require("tap");
const InteractiveModel = require("../InteractiveModel");
const comparableUnserialisedForm = require("./comparableUnserialisedForm");
const testFixture = require("../../test/testFixture");
const sequence = require("../../test/sequenceArray");
const { increment, interval, lookup } = require("../../../fns/lookupFunctions");

test("update row - constant only - can be undone", t => {
  const model = testFixture(InteractiveModel);
  t.same(model.row({ rowName: "increment row" }), sequence(10, 0));
  const pre = comparableUnserialisedForm({ model });
  model.updateRow({ rowName: "increment row", constants: [10], fn: increment });
  t.same(model.row({ rowName: "increment row" }), sequence(10, 10));
  model.undo();
  t.same(model.row({ rowName: "increment row" }), sequence(10, 0));
  const post = comparableUnserialisedForm({ model });
  t.same(post, pre);
  t.end();
});

test("update row - constant only - can be redone", t => {
  const model = testFixture(InteractiveModel);
  model.updateRow({ rowName: "increment row", constants: [10], fn: increment });
  t.same(model.row({ rowName: "increment row" }), sequence(10, 10));
  const pre = comparableUnserialisedForm({ model });
  model.undo();
  model.redo();
  t.same(model.row({ rowName: "increment row" }), sequence(10, 10));
  const post = comparableUnserialisedForm({ model });
  t.same(post, pre);
  t.end();
});

/*
test("update row - fn only - can be undone", t => {
  const model = testFixture(InteractiveModel);
  model.updateRow({ rowName: "increment row", constants: [10], fn: increment });
  const pre = comparableUnserialisedForm({ model });
  model.updateRow({
    rowName: "increment row",
    fn: interval
  });
  t.same(model.row({ rowName: "increment row" }), sequence(10, 0));

  t.end();
});

test("add row to populated model can be redone", t => {
  const model = testFixture(InteractiveModel);
  model.addRow({ rowName: "test row", fn: interval });
  const pre = comparableUnserialisedForm({ model });
  model.undo();
  model.redo();
  t.same(model.lengths, { x: 10, y: 5, z: 1 });
  const post = comparableUnserialisedForm({ model });
  t.same(post, pre);
  t.end();
});

test("add row with dependency can be undone", t => {
  const model = testFixture(InteractiveModel);
  const pre = comparableUnserialisedForm({ model });
  model.addRow({
    rowName: "test row",
    fn: lookup,
    dependsOn: "independent row"
  });
  t.same(model.lengths, { x: 10, y: 5, z: 1 });
  model.undo();
  t.same(model.lengths, { x: 10, y: 4, z: 1 });
  const post = comparableUnserialisedForm({ model });
  t.same(post, pre);
  t.end();
});

test("add row with dependency can be redone", t => {
  const model = testFixture(InteractiveModel);
  model.addRow({
    rowName: "test row",
    fn: lookup,
    dependsOn: "independent row"
  });
  const pre = comparableUnserialisedForm({ model });
  model.undo();
  model.redo();
  t.same(model.lengths, { x: 10, y: 5, z: 1 });
  t.same(model.row({ rowName: "test row" }), [
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19
  ]);
  const post = comparableUnserialisedForm({ model });
  t.same(post, pre);
  t.end();
});
*/
