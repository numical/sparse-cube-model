const { test } = require("tap");
const {
  emptyScenarios,
  populatedScenarios
} = require("../../test/testScaffold");
const InteractiveModel = require("../InteractiveModel");
const comparableUnserialisedForm = require("./comparableUnserialisedForm");
const { interval } = require("../../../fns/lookupFunctions");
const { defaultScenario } = require("../../model/modelMetadata");

emptyScenarios(
  (test, setUp) => {
    test("delete rows to blank model can be undone", t => {
      const model = setUp();
      const rowKeys = ["test row 1", "test row 2"];
      const historyDescription = "test operation";
      rowKeys.forEach(rowKey => model.addRow({ rowKey, fn: interval }));
      t.same(model.lengths, { x: 10, y: 2, z: 1 });
      const pre = comparableUnserialisedForm({ model });
      model.deleteRows({ rowKeys, historyDescription });
      t.same(model.lengths, { x: 0, y: 0, z: 0 });
      model.undo();
      t.same(model.lengths, { x: 10, y: 2, z: 1 });
      const post = comparableUnserialisedForm({ model });
      t.same(post, pre);
      t.end();
    });

    test("delete rows to blank model can be redone", t => {
      const model = setUp();
      const rowKeys = ["test row 1", "test row 2"];
      rowKeys.forEach(rowKey => model.addRow({ rowKey, fn: interval }));
      t.same(model.lengths, { x: 10, y: 2, z: 1 });
      model.deleteRows({ rowKeys, scenarioKey: defaultScenario });
      const pre = comparableUnserialisedForm({ model });
      model.undo();
      model.redo();
      t.same(model.lengths, { x: 0, y: 0, z: 0 });
      const post = comparableUnserialisedForm({ model });
      t.same(post, pre);
      t.end();
    });
  },
  [InteractiveModel]
);

populatedScenarios(
  (test, setUp, fixture) => {
    test("delete last rows on populated model can be undone", t => {
      const model = setUp();
      const rowKeys = ["independent row", "second lookup row"];
      const pre = comparableUnserialisedForm({ model });
      model.deleteRows({ rowKeys });
      const expectedRowDelta = fixture.hasMultipleScenarios ? 0 : -2;
      t.same(model.lengths, fixture.expectedLengths(0, expectedRowDelta, 0));
      model.undo();
      t.same(model.lengths, fixture.expectedLengths());
      const post = comparableUnserialisedForm({ model });
      t.same(post, pre);
      t.end();
    });

    test("delete last rows on populated model can be redone", t => {
      const model = setUp();
      const rowKeys = ["independent row", "second lookup row"];
      model.deleteRows({ rowKeys });
      const pre = comparableUnserialisedForm({ model });
      model.undo();
      model.redo();
      const expectedRowDelta = fixture.hasMultipleScenarios ? 0 : -2;
      t.same(model.lengths, fixture.expectedLengths(0, expectedRowDelta, 0));
      const post = comparableUnserialisedForm({ model });
      t.same(post, pre);
      t.end();
    });

    test("delete (not last) rows on populated model can be undone", t => {
      const model = setUp();
      const rowKeys = ["first lookup row", "second lookup row"];
      const pre = comparableUnserialisedForm({ model, ignoreIndex: true });
      model.deleteRows({ rowKeys });
      const expectedRowDelta = fixture.hasMultipleScenarios ? 0 : -2;
      t.same(model.lengths, fixture.expectedLengths(0, expectedRowDelta, 0));
      model.undo();
      t.same(model.lengths, fixture.expectedLengths());
      const post = comparableUnserialisedForm({ model, ignoreIndex: true });
      t.same(post, pre);
      t.end();
    });

    test("delete (not last) rows on populated model can be redone", t => {
      const model = setUp();
      const rowKeys = ["first lookup row", "second lookup row"];
      model.deleteRows({ rowKeys });
      const pre = comparableUnserialisedForm({ model, ignoreIndex: true });
      model.undo();
      model.redo();
      const expectedRowDelta = fixture.hasMultipleScenarios ? 0 : -2;
      t.same(model.lengths, fixture.expectedLengths(0, expectedRowDelta, 0));
      const post = comparableUnserialisedForm({ model, ignoreIndex: true });
      t.same(post, pre);
      t.end();
    });

    test("delete with dependent rows on populated model can be undone", t => {
      const model = setUp();
      const rowKeys = [
        "increment row",
        "first lookup row",
        "second lookup row"
      ];
      const pre = comparableUnserialisedForm({ model, ignoreIndex: true });
      model.deleteRows({ rowKeys });
      const expectedRowDelta = fixture.hasMultipleScenarios ? 0 : -3;
      t.same(model.lengths, fixture.expectedLengths(0, expectedRowDelta, 0));
      model.undo();
      t.same(model.lengths, fixture.expectedLengths());
      const post = comparableUnserialisedForm({ model, ignoreIndex: true });
      t.same(post, pre);
      t.end();
    });

    test("delete with dependent rows on populated model can be redone", t => {
      const model = setUp();
      const rowKeys = [
        "increment row",
        "first lookup row",
        "second lookup row"
      ];
      model.deleteRows({ rowKeys });
      const pre = comparableUnserialisedForm({ model, ignoreIndex: true });
      model.undo();
      model.redo();
      const expectedRowDelta = fixture.hasMultipleScenarios ? 0 : -3;
      t.same(model.lengths, fixture.expectedLengths(0, expectedRowDelta, 0));
      const post = comparableUnserialisedForm({ model, ignoreIndex: true });
      t.same(post, pre);
      t.end();
    });
  },
  [InteractiveModel]
);
