const { test } = require("tap");
const Model = require("../Model");
const testFixture = require("../../test/testFixture");

test("Blank model stringify does not error", t => {
  const model = new Model();
  t.doesNotThrow(() => model.stringify());
  t.end();
});

test("Blank model stringify returns a string", t => {
  const model = new Model();
  t.type(model.stringify(), "string");
  t.end();
});

test("Populated model stringify does not error", t => {
  const model = testFixture();
  t.doesNotThrow(() => model.stringify());
  t.end();
});

test("Populated model stringify returns a string", t => {
  const model = testFixture();
  t.type(model.stringify(), "string");
  t.end();
});

test("Can pass blank object args to no effect", t => {
  const model = testFixture();
  const args = {};
  t.doesNotThrow(() => model.stringify(args));
  t.type(model.stringify(args), "string");
  t.end();
});

test("Can pass unrecognised object args to no effect", t => {
  const model = testFixture();
  const args = { wibble: true };
  t.doesNotThrow(() => model.stringify(args));
  t.type(model.stringify(args), "string");
  t.end();
});

test("Can pretty print", t => {
  const model = testFixture();
  const compact = model.stringify();
  t.notOk(compact.includes("\n"));
  const pretty = model.stringify({ pretty: true });
  t.ok(pretty.includes("\n"));
  t.end();
});

test("Empty model can be serialized and deserialized", t => {
  const model = new Model();
  const serialized = model.stringify();
  const deserialized = Model.parse(serialized);
  t.same(model, deserialized);
  t.end();
});

test("Populated model can be serialized and deserialized", t => {
  const model = testFixture();
  const serialized = model.stringify();
  const deserialized = Model.parse(serialized);
  t.same(deserialized, model);
  t.end();
});

test("Populated model with row of constants correctly deserializes", t => {
  const model = testFixture();
  const constants = Array(testFixture.meta.intervals.count).fill(5);
  model.addRow({ rowName: "constants row", constants });
  const serialized = model.stringify();
  const deserialized = Model.parse(serialized);
  t.same(deserialized, model);
  t.end();
});

// console.log(testFixture().model.stringify({ pretty: true }));
