const { test } = require("tap");
const {
  emptyScenarios,
  populatedScenarios
} = require("../../test/testScaffold");
const InteractiveModel = require("../InteractiveModel");
const comparableUnserialisedForm = require("./comparableUnserialisedForm");
const { increment, interval, lookup } = require("../../../fns/lookupFunctions");

const rows = [
  { rowKey: "row 0", fn: interval },
  { rowKey: "row 1", constants: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19] },
  { rowKey: "row 2", fn: lookup, dependsOn: { lookup: "row 1" } }
];

emptyScenarios(
  (test, setUp) => {
    test("add rows to blank model can be undone", t => {
      const model = setUp();
      const pre = comparableUnserialisedForm({ model });
      model.addRows({ rows });
      t.same(model.lengths, { x: 10, y: 3, z: 1 });
      model.undo();
      t.same(model.lengths, { x: 0, y: 0, z: 0 });
      const post = comparableUnserialisedForm({ model });
      t.same(post, pre);
      t.end();
    });

    test("add rows to blank model can be redone", t => {
      const model = setUp();
      const serialisedBlank = model.stringify();
      model.addRows({ rows });
      const pre = comparableUnserialisedForm({ model });
      model.undo();
      model.redo();
      t.same(model.lengths, { x: 10, y: 3, z: 1 });
      const post = comparableUnserialisedForm({ model });
      t.same(post, pre);
      t.end();
    });
  },
  [InteractiveModel]
);

populatedScenarios(
  (test, setUp, fixture) => {
    test("add rows to populated model can be undone", t => {
      const model = setUp();
      const pre = comparableUnserialisedForm({ model });
      model.addRows({ rows });
      t.same(model.lengths, { x: 10, y: 7, z: 1 });
      model.undo();
      t.same(model.lengths, { x: 10, y: 4, z: 1 });
      const post = comparableUnserialisedForm({ model });
      t.same(post, pre);
      t.end();
    });

    test("add rows to populated model can be redone", t => {
      const model = setUp();
      model.addRows({ rows, historyDescription: "for code coverage" });
      const pre = comparableUnserialisedForm({ model });
      model.undo();
      model.redo();
      t.same(model.lengths, { x: 10, y: 7, z: 1 });
      const post = comparableUnserialisedForm({ model });
      t.same(post, pre);
      t.end();
    });
  },
  [InteractiveModel]
);
