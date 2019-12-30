const { test } = require("tap");
const InteractiveModel = require("../InteractiveModel");
const { increment, interval, lookup } = require("../../../fns/lookupFunctions");

const testMeta = {
  intervals: {
    count: 5
  }
};

test("blank model has zero undo and redo levels", t => {
  const model = new InteractiveModel(testMeta);
  t.same(model.undoOps(), []);
  t.same(model.redoOps(), []);
  t.end();
});

test("history increments after single operation", t => {
  const model = new InteractiveModel(testMeta);
  model.addRow({
    rowName: "test row",
    fn: interval
  });
  t.same(model.undoOps(), ["add row 'test row'"]);
  t.same(model.redoOps(), []);
  t.end();
});

test("history increments after multiple operation", t => {
  const model = new InteractiveModel(testMeta);
  model.addRow({
    rowName: "test row",
    fn: interval
  });
  model.updateRow({
    rowName: "test row",
    fn: increment,
    constants: [100]
  });
  model.addScenario({ scenarioName: "second scenario" });
  t.same(model.undoOps(), [
    "add row 'test row'",
    "update row 'test row'",
    "add scenario 'second scenario'"
  ]);
  t.same(model.redoOps(), []);
  t.end();
});

test("undo errors if no history", t => {
  const model = new InteractiveModel(testMeta);
  t.throws(() => model.undo(), new Error("Nothing to undo."));
  t.end();
});

test("redo errors if no history", t => {
  const model = new InteractiveModel(testMeta);
  t.throws(() => model.redo(), new Error("Nothing to redo."));
  t.end();
});

test("undo updates single op history", t => {
  const model = new InteractiveModel(testMeta);
  model.addRow({
    rowName: "test row",
    fn: interval
  });
  model.undo();
  t.same(model.undoOps(), []);
  t.same(model.redoOps(), ["add row 'test row'"]);
  t.end();
});

test("second undo on single op history errors", t => {
  const model = new InteractiveModel(testMeta);
  model.addRow({
    rowName: "test row",
    fn: interval
  });
  model.undo();
  t.throws(() => model.undo(), new Error("Nothing to undo."));
  t.end();
});

test("redo after no undo on single op history errors", t => {
  const model = new InteractiveModel(testMeta);
  model.addRow({
    rowName: "test row",
    fn: interval
  });
  t.throws(() => model.redo(), new Error("Nothing to redo."));
  t.end();
});

test("redo after undo on single op history equivalent to initial op", t => {
  const model = new InteractiveModel(testMeta);
  model.addRow({
    rowName: "test row",
    fn: interval
  });
  model.undo();
  model.redo();
  t.same(model.undoOps(), ["add row 'test row'"]);
  t.same(model.redoOps(), []);
  t.end();
});

test("multiple undo/redo cycles equivalent to initial op", t => {
  const model = new InteractiveModel(testMeta);
  model.addRow({
    rowName: "test row",
    fn: interval
  });
  for (let i = 0; i < 10; i++) {
    model.undo();
    model.redo();
  }
  t.same(model.undoOps(), ["add row 'test row'"]);
  t.same(model.redoOps(), []);
  t.end();
});

test("undo/redo over multiple ops updates history correctly", t => {
  const model = new InteractiveModel(testMeta);
  model.addRow({
    rowName: "test row 1",
    fn: interval
  });
  model.updateRow({
    rowName: "test row 1",
    fn: increment,
    constants: [100]
  });
  model.addScenario({ scenarioName: "second scenario" });
  model.addRow({
    scenarioName: "second scenario",
    rowName: "test row 2",
    fn: lookup,
    dependsOn: "test row 1"
  });
  t.same(model.undoOps(), [
    "add row 'test row 1'",
    "update row 'test row 1'",
    "add scenario 'second scenario'",
    "add row 'test row 2' to scenario 'second scenario'"
  ]);
  t.same(model.redoOps(), []);
  model.undo();
  t.same(model.undoOps(), [
    "add row 'test row 1'",
    "update row 'test row 1'",
    "add scenario 'second scenario'"
  ]);
  t.same(model.redoOps(), [
    "add row 'test row 2' to scenario 'second scenario'"
  ]);
  model.undo();
  t.same(model.undoOps(), ["add row 'test row 1'", "update row 'test row 1'"]);
  t.same(model.redoOps(), [
    "add scenario 'second scenario'",
    "add row 'test row 2' to scenario 'second scenario'"
  ]);
  model.undo();
  t.same(model.undoOps(), ["add row 'test row 1'"]);
  t.same(model.redoOps(), [
    "update row 'test row 1'",
    "add scenario 'second scenario'",
    "add row 'test row 2' to scenario 'second scenario'"
  ]);
  model.undo();
  t.same(model.undoOps(), []);
  t.same(model.redoOps(), [
    "add row 'test row 1'",
    "update row 'test row 1'",
    "add scenario 'second scenario'",
    "add row 'test row 2' to scenario 'second scenario'"
  ]);
  model.redo();
  t.same(model.undoOps(), ["add row 'test row 1'"]);
  t.same(model.redoOps(), [
    "update row 'test row 1'",
    "add scenario 'second scenario'",
    "add row 'test row 2' to scenario 'second scenario'"
  ]);
  model.redo();
  t.same(model.undoOps(), ["add row 'test row 1'", "update row 'test row 1'"]);
  t.same(model.redoOps(), [
    "add scenario 'second scenario'",
    "add row 'test row 2' to scenario 'second scenario'"
  ]);
  model.redo();
  t.same(model.undoOps(), [
    "add row 'test row 1'",
    "update row 'test row 1'",
    "add scenario 'second scenario'"
  ]);
  t.same(model.redoOps(), [
    "add row 'test row 2' to scenario 'second scenario'"
  ]);
  model.redo();
  t.same(model.undoOps(), [
    "add row 'test row 1'",
    "update row 'test row 1'",
    "add scenario 'second scenario'",
    "add row 'test row 2' to scenario 'second scenario'"
  ]);
  t.same(model.redoOps(), []);
  t.end();
});

test("adding new ops after undo clears redo items", t => {
  const model = new InteractiveModel(testMeta);
  model.addRow({
    rowName: "test row 1",
    fn: interval
  });
  model.updateRow({
    rowName: "test row 1",
    fn: increment,
    constants: [100]
  });
  model.addScenario({ scenarioName: "second scenario" });
  model.addRow({
    scenarioName: "second scenario",
    rowName: "test row 2",
    fn: lookup,
    dependsOn: "test row 1"
  });
  t.same(model.undoOps(), [
    "add row 'test row 1'",
    "update row 'test row 1'",
    "add scenario 'second scenario'",
    "add row 'test row 2' to scenario 'second scenario'"
  ]);
  t.same(model.redoOps(), []);
  model.undo();
  model.undo();
  t.same(model.undoOps(), ["add row 'test row 1'", "update row 'test row 1'"]);
  t.same(model.redoOps(), [
    "add scenario 'second scenario'",
    "add row 'test row 2' to scenario 'second scenario'"
  ]);
  model.addRow({ rowName: "test row 3", fn: interval });
  t.same(model.undoOps(), [
    "add row 'test row 1'",
    "update row 'test row 1'",
    "add row 'test row 3'"
  ]);
  t.same(model.redoOps(), []);
  t.end();
});

test("history displays custom history descriptions", t => {
  const model = new InteractiveModel(testMeta);
  model.addRow({
    rowName: "test row",
    fn: interval,
    historyDescription: "first op"
  });
  model.updateRow({
    rowName: "test row",
    fn: increment,
    constants: [100],
    historyDescription: "second op"
  });
  model.addScenario({
    scenarioName: "second scenario",
    historyDescription: "third op"
  });
  t.same(model.undoOps(), ["first op", "second op", "third op"]);
  t.same(model.redoOps(), []);
  t.end();
});
