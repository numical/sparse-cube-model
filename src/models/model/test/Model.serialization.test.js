const { test } = require("tap");
const { version } = require("../../../../package");
const Model = require("../Model");
const testFixture = require("../../test/testFixtures");

const { setUp } = testFixture.withRows;

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
  const model = setUp();
  t.doesNotThrow(() => model.stringify());
  t.end();
});

test("Populated model stringify returns a string", t => {
  const model = setUp();
  t.type(model.stringify(), "string");
  t.end();
});

test("Can pass blank object args to no effect", t => {
  const model = setUp();
  const args = {};
  t.doesNotThrow(() => model.stringify(args));
  t.type(model.stringify(args), "string");
  t.end();
});

test("Can pass unrecognised object args to no effect", t => {
  const model = setUp();
  const args = { wibble: true };
  t.doesNotThrow(() => model.stringify(args));
  t.type(model.stringify(args), "string");
  t.end();
});

test("Can pretty print", t => {
  const model = setUp();
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
  const model = setUp();
  const serialized = model.stringify();
  const deserialized = Model.parse(serialized);
  t.same(deserialized, model);
  t.end();
});

test("Populated model with row of constants correctly deserializes", t => {
  const model = setUp();
  const constants = Array(10).fill(5);
  model.addRow({ rowKey: "constants row", constants });
  const serialized = model.stringify();
  const deserialized = Model.parse(serialized);
  t.same(deserialized, model);
  t.end();
});

test("Parsing fails explicitly if fn not in fn dictionary", t => {
  const model = setUp();
  const unknownFn = () => 10;
  unknownFn.key = "unknown";
  model.addRow({ rowKey: "test row", fn: unknownFn });
  const serialized = model.stringify();
  t.throws(
    () => Model.parse(serialized),
    new Error("Missing function key 'unknown'")
  );
  t.end();
});

test("default model has package version", t => {
  const model = setUp();
  const serialized = model.stringify();
  const expected = `"version":"${version}"`;
  t.match(serialized, expected);
  t.end();
});

test("model updates old (compatible) versions", t => {
  const pre = setUp().stringify();
  const updated = pre.replace(version, "0.0.1");
  t.match(updated, `"version":"0.0.1"`);
  const post = Model.parse(updated).stringify();
  const expected = `"version":"${version}"`;
  t.match(post, expected);
  t.end();
});
