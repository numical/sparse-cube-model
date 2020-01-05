const { test } = require("tap");
const InteractiveModel = require("../InteractiveModel");
const comparableUnserialisedForm = require("./comparableUnserialisedForm");
const testFixture = require("../../test/testFixture");
const { increment, interval, lookup } = require("../../../fns/lookupFunctions");
const { defaultScenario } = require("../../model/internal/modelMetadata");

test("patch row - change constants only - can be undone", t => {
  const rowName = "increment row";
  const historyDescription = "test operation";
  const model = testFixture(InteractiveModel);
  t.same(model.row({ rowName }), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const pre = comparableUnserialisedForm({ model });
  model.patchRow({ rowName, constants: [10], historyDescription });
  t.same(model.row({ rowName }), [10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  model.undo();
  t.same(model.row({ rowName }), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const post = comparableUnserialisedForm({ model });
  t.same(post, pre);
  t.end();
});

test("patch row - change constant only - can be redone", t => {
  const rowName = "increment row";
  const model = testFixture(InteractiveModel);
  model.patchRow({ rowName, constants: [10], scenarioName: defaultScenario });
  const pre = comparableUnserialisedForm({ model });
  model.undo();
  model.redo();
  t.same(model.row({ rowName }), [10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  const post = comparableUnserialisedForm({ model });
  t.same(post, pre);
  t.end();
});

test("patch row - change fn only - can be undone", t => {
  const rowName = "increment row";
  const model = testFixture(InteractiveModel);
  model.patchRow({ rowName, constants: [10] });
  t.same(model.row({ rowName }), [10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  const pre = comparableUnserialisedForm({ model });
  model.patchRow({
    rowName,
    fn: interval
  });
  t.same(model.row({ rowName }), [10, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  model.undo();
  t.same(model.row({ rowName }), [10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  const post = comparableUnserialisedForm({ model });
  t.same(post, pre);
  t.end();
});

test("patch row - change fn only - can be redone", t => {
  const rowName = "increment row";
  const model = testFixture(InteractiveModel);
  model.patchRow({ rowName, constants: [10] });
  model.patchRow({
    rowName,
    fn: interval
  });
  const pre = comparableUnserialisedForm({ model });
  model.undo();
  model.redo();
  t.same(model.row({ rowName }), [10, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const post = comparableUnserialisedForm({ model });
  t.same(post, pre);
  t.end();
});

test("patch row - change depends on - can be undone", t => {
  const rowName = "second lookup row";
  const model = testFixture(InteractiveModel);
  t.same(model.row({ rowName }), [1000, 0, 1, 2, 3, 4, 5, 6, 7, 8]);
  const pre = comparableUnserialisedForm({ model });
  model.patchRow({
    rowName,
    dependsOn: "independent row"
  });
  t.same(model.row({ rowName }), [1000, 10, 11, 12, 13, 14, 15, 16, 17, 18]);
  model.undo();
  t.same(model.row({ rowName }), [1000, 0, 1, 2, 3, 4, 5, 6, 7, 8]);
  const post = comparableUnserialisedForm({ model });
  t.same(post, pre);
  t.end();
});

test("patch row - change depends on - can be redone", t => {
  const rowName = "second lookup row";
  const model = testFixture(InteractiveModel);
  model.patchRow({
    rowName,
    dependsOn: "independent row"
  });
  const pre = comparableUnserialisedForm({ model });
  model.undo();
  model.redo();
  t.same(model.row({ rowName }), [1000, 10, 11, 12, 13, 14, 15, 16, 17, 18]);
  const post = comparableUnserialisedForm({ model });
  t.same(post, pre);
  t.end();
});

test("patch row - change everything (merge constants) - can be undone", t => {
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
  model.patchRow({
    rowName,
    fn: lookup,
    dependsOn: "independent row",
    constants: {
      7: 33
    }
  });
  t.same(model.row({ rowName }), [10, 11, 12, 100, 14, 15, 50, 33, 18, 19]);
  model.undo();
  t.same(model.row({ rowName }), [10, 11, 12, 100, 101, 102, 50, 51, 52, 53]);
  const post = comparableUnserialisedForm({ model });
  t.same(post, pre);
  t.end();
});

test("patch row - change everything (merge constants) - can be redone", t => {
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
  model.patchRow({
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
  t.same(model.row({ rowName }), [10, 11, 12, 100, 14, 15, 50, 33, 18, 19]);
  const post = comparableUnserialisedForm({ model });
  t.same(post, pre);
  t.end();
});
