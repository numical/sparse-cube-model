const { test } = require("tap");
const InteractiveModel = require("../InteractiveModel");
const comparableUnserialisedForm = require("./comparableUnserialisedForm");
const testFixture = require("../../test/testFixture");
const {
  increment,
  interval,
  lookup,
  lookupPrevious
} = require("../../../fns/lookupFunctions");

test("update row - change constants only - can be undone", t => {
  const rowName = "increment row";
  const model = testFixture(InteractiveModel);
  t.same(model.row({ rowName }), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const pre = comparableUnserialisedForm({ model });
  model.updateRow({ rowName, constants: [10], fn: increment });
  t.same(model.row({ rowName }), [10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  model.undo();
  t.same(model.row({ rowName }), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const post = comparableUnserialisedForm({ model });
  t.same(post, pre);
  t.end();
});

test("update row - change constant only - can be redone", t => {
  const rowName = "increment row";
  const model = testFixture(InteractiveModel);
  model.updateRow({ rowName, constants: [10], fn: increment });
  const pre = comparableUnserialisedForm({ model });
  model.undo();
  model.redo();
  t.same(model.row({ rowName }), [10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  const post = comparableUnserialisedForm({ model });
  t.same(post, pre);
  t.end();
});

test("update row - change fn only - can be undone", t => {
  const rowName = "increment row";
  const model = testFixture(InteractiveModel);
  model.updateRow({ rowName, constants: [10], fn: increment });
  const pre = comparableUnserialisedForm({ model });
  model.updateRow({
    rowName,
    fn: interval
  });
  t.same(model.row({ rowName }), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  model.undo();
  t.same(model.row({ rowName }), [10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  const post = comparableUnserialisedForm({ model });
  t.same(post, pre);
  t.end();
});

test("update row - change fn only - can be redone", t => {
  const rowName = "increment row";
  const model = testFixture(InteractiveModel);
  model.updateRow({ rowName, constants: [10], fn: increment });
  model.updateRow({
    rowName,
    fn: interval
  });
  const pre = comparableUnserialisedForm({ model });
  model.undo();
  model.redo();
  t.same(model.row({ rowName }), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const post = comparableUnserialisedForm({ model });
  t.same(post, pre);
  t.end();
});

test("update row - change depends on - can be undone", t => {
  const rowName = "second lookup row";
  const model = testFixture(InteractiveModel);
  t.same(model.row({ rowName }), [1000, 0, 1, 2, 3, 4, 5, 6, 7, 8]);
  const pre = comparableUnserialisedForm({ model });
  model.updateRow({
    rowName,
    fn: lookupPrevious,
    dependsOn: "independent row",
    constants: [1000]
  });
  t.same(model.row({ rowName }), [1000, 10, 11, 12, 13, 14, 15, 16, 17, 18]);
  model.undo();
  t.same(model.row({ rowName }), [1000, 0, 1, 2, 3, 4, 5, 6, 7, 8]);
  const post = comparableUnserialisedForm({ model });
  t.same(post, pre);
  t.end();
});

test("update row - change depends on - can be redone", t => {
  const rowName = "second lookup row";
  const model = testFixture(InteractiveModel);
  model.updateRow({
    rowName,
    fn: lookupPrevious,
    dependsOn: "independent row",
    constants: [1000]
  });
  const pre = comparableUnserialisedForm({ model });
  model.undo();
  model.redo();
  t.same(model.row({ rowName }), [1000, 10, 11, 12, 13, 14, 15, 16, 17, 18]);
  const post = comparableUnserialisedForm({ model });
  t.same(post, pre);
  t.end();
});

test("update row - change everything - can be undone", t => {
  const rowName = "test row";
  const model = testFixture(InteractiveModel);
  model.addRow({
    rowName,
    fn: increment,
    constants: {
      0: 10,
      3: 100,
      6: 50
    }
  });
  t.same(model.row({ rowName }), [10, 11, 12, 100, 101, 102, 50, 51, 52, 53]);
  const pre = comparableUnserialisedForm({ model });
  model.updateRow({
    rowName,
    fn: lookup,
    dependsOn: "independent row",
    constants: {
      7: 33
    }
  });
  t.same(model.row({ rowName }), [10, 11, 12, 13, 14, 15, 16, 33, 18, 19]);
  model.undo();
  t.same(model.row({ rowName }), [10, 11, 12, 100, 101, 102, 50, 51, 52, 53]);
  const post = comparableUnserialisedForm({ model });
  t.same(post, pre);
  t.end();
});

test("update row - change everything - can be redone", t => {
  const rowName = "test row";
  const model = testFixture(InteractiveModel);
  model.addRow({
    rowName,
    fn: increment,
    constants: {
      0: 10,
      3: 100,
      6: 50
    }
  });
  model.updateRow({
    rowName,
    fn: lookup,
    dependsOn: "independent row",
    constants: {
      7: 33
    }
  });
  const pre = comparableUnserialisedForm({ model });
  model.undo();
  model.redo();
  t.same(model.row({ rowName }), [10, 11, 12, 13, 14, 15, 16, 33, 18, 19]);
  const post = comparableUnserialisedForm({ model });
  t.same(post, pre);
  t.end();
});
