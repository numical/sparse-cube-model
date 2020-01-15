const { test } = require("tap");
const MappedModel = require("../MappedModel");
const testFixture = require("../../test/testFixture");

const assertStringifiedForm = (t, stringified) => {
  t.ok(Array.isArray(stringified));
  t.same(stringified.length, 2);
  t.type(stringified[0], "string");
  t.type(stringified[1], "string");
};

test("Blank model stringify does not error", t => {
  const model = new MappedModel();
  t.doesNotThrow(() => model.stringify());
  t.end();
});

test("Blank model stringify returns an array of 2 Strings", t => {
  const model = new MappedModel();
  assertStringifiedForm(t, model.stringify());
  t.end();
});

test("Populated model stringify does not error", t => {
  const model = testFixture(MappedModel);
  t.doesNotThrow(() => model.stringify());
  t.end();
});

test("Populated model stringify returns an array of 2 strings", t => {
  const model = testFixture(MappedModel);
  assertStringifiedForm(t, model.stringify());
  t.end();
});

test("Can pass blank object args to no effect", t => {
  const model = testFixture(MappedModel);
  const args = {};
  t.doesNotThrow(() => model.stringify(args));
  assertStringifiedForm(t, model.stringify(args));
  t.end();
});

test("Can pass unrecognised object args to no effect", t => {
  const model = testFixture(MappedModel);
  const args = { wibble: true };
  t.doesNotThrow(() => model.stringify(args));
  assertStringifiedForm(t, model.stringify());
  t.end();
});

test("Can pretty print", t => {
  const model = testFixture(MappedModel);
  const compact = model.stringify();
  t.notOk(compact.includes("\n"));
  const pretty = model.stringify({ pretty: true });
  assertStringifiedForm(t, pretty);
  t.ok(pretty[0].includes("\n"));
  t.ok(pretty[1].includes("\n"));
  t.end();
});

test("Empty model can be serialized and deserialized", t => {
  const model = new MappedModel();
  const serialized = model.stringify();
  const deserialized = MappedModel.parse(serialized);
  t.same(model, deserialized);
  t.end();
});

test("Populated model can be serialized and deserialized", t => {
  const model = testFixture(MappedModel);
  const serialized = model.stringify();
  const deserialized = MappedModel.parse(serialized);
  t.same(model, deserialized);
  t.end();
});

test("Populated model with row of constants correctly deserializes", t => {
  const model = testFixture(MappedModel);
  const constants = Array(testFixture.meta.intervals.count).fill(5);
  model.addRow({ rowKey: "constants row", constants });
  const serialized = model.stringify();
  const deserialized = MappedModel.parse(serialized);
  t.same(model, deserialized);
  t.end();
});

// console.log(testFixture(MappedModel).model.stringify({ pretty: true }));
