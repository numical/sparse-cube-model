const { test } = require("tap");
const {
  emptyScenarios,
  populatedScenarios
} = require("../../test/testScaffold");
const InteractiveModel = require("../InteractiveModel");
const comparableUnserialisedForm = require("./comparableUnserialisedForm");
const { interval, lookup } = require("../../../fns/lookupFunctions");

emptyScenarios(
  (test, setUp, { Type }) => {
    test("add row to blank model can be undone", t => {
      const model = setUp();
      const pre = comparableUnserialisedForm({ model });
      model.addRow({ rowKey: "test row", fn: interval });
      t.same(model.lengths, { x: 10, y: 1, z: 1 });
      model.undo();
      t.same(model.lengths, { x: 0, y: 0, z: 0 });
      const post = comparableUnserialisedForm({ model });
      t.same(post, pre);
      t.end();
    });

    test("add row to blank model can be redone", t => {
      const model = setUp();
      model.addRow({ rowKey: "test row", fn: interval });
      const pre = comparableUnserialisedForm({ model });
      model.undo();
      model.redo();
      t.same(model.lengths, { x: 10, y: 1, z: 1 });
      const post = comparableUnserialisedForm({ model });
      t.same(post, pre);
      t.end();
    });
  },
  [InteractiveModel]
);

populatedScenarios(
  (test, setUp, fixture) => {
    test("add row to populated model can be undone", t => {
      const model = setUp();
      const pre = comparableUnserialisedForm({ model });
      model.addRow({ rowKey: "test row", fn: interval });
      t.same(model.lengths, fixture.expectedLengths(0, 1, 0));
      model.undo();
      t.same(model.lengths, fixture.expectedLengths());
      const post = comparableUnserialisedForm({ model });
      t.same(post, pre);
      t.end();
    });

    test("add row to populated model can be redone", t => {
      const model = setUp();
      model.addRow({ rowKey: "test row", fn: interval });
      const pre = comparableUnserialisedForm({ model });
      model.undo();
      model.redo();
      t.same(model.lengths, fixture.expectedLengths(0, 1, 0));
      const post = comparableUnserialisedForm({ model });
      t.same(post, pre);
      t.end();
    });

    test("add row with dependency can be undone", t => {
      const model = setUp();
      const pre = comparableUnserialisedForm({ model });
      model.addRow({
        rowKey: "test row",
        fn: lookup,
        dependsOn: { lookup: "independent row" }
      });
      t.same(model.lengths, fixture.expectedLengths(0, 1, 0));
      model.undo();
      t.same(model.lengths, fixture.expectedLengths());
      const post = comparableUnserialisedForm({ model });
      t.same(post, pre);
      t.end();
    });

    test("add row with dependency can be redone", t => {
      const model = setUp();
      model.addRow({
        rowKey: "test row",
        fn: lookup,
        dependsOn: { lookup: "independent row" }
      });
      const pre = comparableUnserialisedForm({ model });
      model.undo();
      model.redo();
      t.same(model.lengths, fixture.expectedLengths(0, 1, 0));
      t.same(model.row({ rowKey: "test row" }), [
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
  },
  [InteractiveModel]
);
