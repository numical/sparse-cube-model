const { test } = require("tap");
const Model = require("../Model");
const testFixture = require("./testFixture");

test("Blank model toString does not error", t => {
  const model = new Model();
  t.doesNotThrow(() => model.toString());
  t.end();
});

test("Blank model toString returns a string", t => {
  const model = new Model();
  t.type(model.toString(), "string");
  t.end();
});

test("Populated model toString does not error", t => {
  const { model } = testFixture();
  t.doesNotThrow(() => model.toString());
  t.end();
});

test("Populated model toString returns a string", t => {
  const { model } = testFixture();
  t.type(model.toString(), "string");
  t.end();
});

test("Can pass blank object args to no effect", t => {
  const { model } = testFixture();
  const args = {};
  t.doesNotThrow(() => model.toString(args));
  t.type(model.toString(args), "string");
  t.end();
});

test("Can pass unrecognised object args to no effect", t => {
  const { model } = testFixture();
  const args = { wibble: true };
  t.doesNotThrow(() => model.toString(args));
  t.type(model.toString(args), "string");
  t.end();
});

test("Can pretty print", t => {
  const { model } = testFixture();
  const compact = model.toString();
  t.notOk(compact.includes("\n"));
  const pretty = model.toString({ pretty: true });
  t.ok(pretty.includes("\n"));
  t.end();
});

test("Empty model can be serialized and deserialized", t => {
  const model = new Model();
  const serialized = model.toString();
  const deserialized = Model.from(serialized);
  t.same(model, deserialized);
  t.end();
});

test("Populated model can be serialized and deserialized", t => {
  const { model } = testFixture();
  const serialized = model.toString();
  const deserialized = Model.from(serialized);
  t.same(model, deserialized);
  t.end();
});

test("Populated model with row of constants correctly deserializes", t => {
  const { intervals, model } = testFixture();
  const constants = Array(intervals.count).fill(5);
  model.addRow({ rowName: "constants row", constants });
  const serialized = model.toString();
  const deserialized = Model.from(serialized);
  t.same(model, deserialized);
  t.end();
});

// console.log(testFixture().model.toString({ pretty: true }));
