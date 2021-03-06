const { test } = require("tap");
const { populatedScenarios } = require("../../test/testScaffold");
const InteractiveModel = require("../InteractiveModel");
const comparableUnserialisedForm = require("./comparableUnserialisedForm");
const {
  increment,
  interval,
  lookup,
  lookupPrevious
} = require("../../../fns/lookupFunctions");

populatedScenarios(
  (test, setUp, fixture) => {
    test("update row - change constants only - can be undone", t => {
      const rowKey = "increment row";
      const historyDescription = "test operation";
      const model = setUp();
      t.same(model.row({ rowKey }), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
      const pre = comparableUnserialisedForm({ model });
      model.updateRow({
        rowKey,
        constants: [10],
        fn: increment,
        historyDescription
      });
      t.same(model.row({ rowKey }), [10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
      model.undo();
      t.same(model.row({ rowKey }), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
      const post = comparableUnserialisedForm({ model });
      t.same(post, pre);
      t.end();
    });

    test("update row - change constant only - can be redone", t => {
      const rowKey = "increment row";
      const model = setUp();
      model.updateRow({ rowKey, constants: [10], fn: increment });
      const pre = comparableUnserialisedForm({ model });
      model.undo();
      model.redo();
      t.same(model.row({ rowKey }), [10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
      const post = comparableUnserialisedForm({ model });
      t.same(post, pre);
      t.end();
    });

    test("update row - change fn only - can be undone", t => {
      const rowKey = "increment row";
      const model = setUp();
      model.updateRow({ rowKey, constants: [10], fn: increment });
      const pre = comparableUnserialisedForm({ model });
      model.updateRow({
        rowKey,
        fn: interval
      });
      t.same(model.row({ rowKey }), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
      model.undo();
      t.same(model.row({ rowKey }), [10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
      const post = comparableUnserialisedForm({ model });
      t.same(post, pre);
      t.end();
    });

    test("update row - change fn only - can be redone", t => {
      const rowKey = "increment row";
      const model = setUp();
      model.updateRow({ rowKey, constants: [10], fn: increment });
      model.updateRow({
        rowKey,
        fn: interval
      });
      const pre = comparableUnserialisedForm({ model });
      model.undo();
      model.redo();
      t.same(model.row({ rowKey }), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
      const post = comparableUnserialisedForm({ model });
      t.same(post, pre);
      t.end();
    });

    test("update row - change depends on - can be undone", t => {
      const rowKey = "second lookup row";
      const model = setUp();
      t.same(model.row({ rowKey }), [1000, 0, 1, 2, 3, 4, 5, 6, 7, 8]);
      const pre = comparableUnserialisedForm({ model });
      model.updateRow({
        rowKey,
        fn: lookupPrevious,
        dependsOn: { lookup: "independent row" },
        constants: [1000]
      });
      t.same(model.row({ rowKey }), [1000, 10, 11, 12, 13, 14, 15, 16, 17, 18]);
      model.undo();
      t.same(model.row({ rowKey }), [1000, 0, 1, 2, 3, 4, 5, 6, 7, 8]);
      const post = comparableUnserialisedForm({ model });
      t.same(post, pre);
      t.end();
    });

    test("update row - change depends on - can be redone", t => {
      const rowKey = "second lookup row";
      const model = setUp();
      model.updateRow({
        rowKey,
        fn: lookupPrevious,
        dependsOn: { lookup: "independent row" },
        constants: [1000]
      });
      const pre = comparableUnserialisedForm({ model });
      model.undo();
      model.redo();
      t.same(model.row({ rowKey }), [1000, 10, 11, 12, 13, 14, 15, 16, 17, 18]);
      const post = comparableUnserialisedForm({ model });
      t.same(post, pre);
      t.end();
    });

    test("update row - change everything - can be undone", t => {
      const rowKey = "test row";
      const model = setUp();
      model.addRow({
        rowKey,
        fn: increment,
        constants: {
          0: 10,
          3: 100,
          6: 50
        }
      });
      t.same(model.row({ rowKey }), [
        10,
        11,
        12,
        100,
        101,
        102,
        50,
        51,
        52,
        53
      ]);
      const pre = comparableUnserialisedForm({ model });
      model.updateRow({
        rowKey,
        fn: lookup,
        dependsOn: { lookup: "independent row" },
        constants: {
          7: 33
        }
      });
      t.same(model.row({ rowKey }), [10, 11, 12, 13, 14, 15, 16, 33, 18, 19]);
      model.undo();
      t.same(model.row({ rowKey }), [
        10,
        11,
        12,
        100,
        101,
        102,
        50,
        51,
        52,
        53
      ]);
      const post = comparableUnserialisedForm({ model });
      t.same(post, pre);
      t.end();
    });

    test("update row - change everything - can be redone", t => {
      const rowKey = "test row";
      const model = setUp();
      model.addRow({
        rowKey,
        fn: increment,
        constants: {
          0: 10,
          3: 100,
          6: 50
        }
      });
      model.updateRow({
        rowKey,
        fn: lookup,
        dependsOn: { lookup: "independent row" },
        constants: {
          7: 33
        }
      });
      const pre = comparableUnserialisedForm({ model });
      model.undo();
      model.redo();
      t.same(model.row({ rowKey }), [10, 11, 12, 13, 14, 15, 16, 33, 18, 19]);
      const post = comparableUnserialisedForm({ model });
      t.same(post, pre);
      t.end();
    });
  },
  [InteractiveModel]
);
