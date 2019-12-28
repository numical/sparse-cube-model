const { test } = require("tap");
const InteractiveModel = require("../InteractiveModel");
const unmapSerialisedForm = require("./unmapSerialisedForm");
const testFixture = require("./testFixture");
const { increment, interval, lookup } = require("../../fns/lookupFunctions");

const testMeta = {
  intervals: {
    count: 10
  }
};

test("add row to blank model can be undone", t => {
  const model = new InteractiveModel(testMeta);
  const origSerialised = unmapSerialisedForm(model.stringify());
  model.addRow({ rowName: "test row", fn: interval });
  t.same(model.lengths, { x: 10, y: 1, z: 1 });
  model.undo();
  t.same(model.lengths, { x: 0, y: 0, z: 0 });
  const undoSerialiased = unmapSerialisedForm(model.stringify());
  t.same(undoSerialiased, origSerialised);
  t.end();
});

test("add row to blank model can be redone", t => {
  const model = new InteractiveModel(testMeta);
  const serialisedBlank = model.stringify();
  model.addRow({ rowName: "test row", fn: interval });
  const origSerialised = unmapSerialisedForm(model.stringify());
  model.undo();
  model.redo();
  t.same(model.lengths, { x: 10, y: 1, z: 1 });
  const redoSerialiased = unmapSerialisedForm(model.stringify());
  t.same(redoSerialiased, origSerialised);
  t.end();
});

test("add row to populated model can be undone", t => {
  const model = testFixture(InteractiveModel);
  const origSerialised = unmapSerialisedForm(model.stringify());
  model.addRow({ rowName: "test row", fn: interval });
  t.same(model.lengths, { x: 10, y: 5, z: 1 });
  model.undo();
  t.same(model.lengths, { x: 10, y: 4, z: 1 });
  const undoSerialiased = unmapSerialisedForm(model.stringify());
  t.same(undoSerialiased, origSerialised);
  t.end();
});

test("add row to populated model can be redone", t => {
  const model = testFixture(InteractiveModel);
  model.addRow({ rowName: "test row", fn: interval });
  const origSerialised = unmapSerialisedForm(model.stringify());
  model.undo();
  model.redo();
  t.same(model.lengths, { x: 10, y: 5, z: 1 });
  const redoSerialiased = unmapSerialisedForm(model.stringify());
  t.same(redoSerialiased, origSerialised);
  t.end();
});

test("add row with dependency can be undone", t => {
  const model = testFixture(InteractiveModel);
  const origSerialised = unmapSerialisedForm(model.stringify());
  model.addRow({
    rowName: "test row",
    fn: lookup,
    dependsOn: "independent row"
  });
  t.same(model.lengths, { x: 10, y: 5, z: 1 });
  model.undo();
  t.same(model.lengths, { x: 10, y: 4, z: 1 });
  const undoSerialiased = unmapSerialisedForm(model.stringify());
  t.same(undoSerialiased, origSerialised);
  t.end();
});

test("add row with dependency can be redone", t => {
  const model = testFixture(InteractiveModel);
  model.addRow({
    rowName: "test row",
    fn: lookup,
    dependsOn: "independent row"
  });
  const origSerialised = unmapSerialisedForm(model.stringify());
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
  const redoSerialiased = unmapSerialisedForm(model.stringify());
  t.same(redoSerialiased, origSerialised);
  t.end();
});
