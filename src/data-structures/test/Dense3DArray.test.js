const { test, only } = require("tap");
const Dense3DArray = require("../Dense3DArray");
const iterate3D = require("../iterate3D");

test("Array creation", t => {
  const { get, set, lengths } = new Dense3DArray();
  t.type(get, "function");
  t.type(set, "function");
  t.type(lengths, "object");
  t.end();
});

test("Empty array has zero lengths", t => {
  const { get, lengths } = new Dense3DArray();
  t.same(lengths, { x: 0, y: 0, z: 0 });
  t.end();
});

test("Empty array throws on a get", t => {
  const { get } = new Dense3DArray();
  t.throws(get.bind(null, 0, 0, 0), RangeError);
  t.end();
});

test("get throws RangeError when indices exceeded", t => {
  const value = 7;
  const d3a = new Dense3DArray();
  const { get, set } = d3a;
  set(1, 2, 3, value);
  t.equals(get(1, 2, 3), value);
  t.equals(get(0, 2, 3), 0);
  t.throws(get.bind(null, 2, 2, 3), RangeError);
  t.equals(get(1, 1, 3), 0);
  t.throws(get.bind(null, 1, 3, 3), RangeError);
  t.equals(get(1, 2, 2), 0);
  t.throws(get.bind(null, 1, 2, 4), RangeError);
  t.end();
});

test("isEmpty when array is empty", t => {
  const d3a = new Dense3DArray();
  t.ok(d3a.isEmpty());
  t.end();
});

test("isEmpty when array is not empty", t => {
  const d3a = new Dense3DArray();
  d3a.set(0, 0, 0, 4);
  t.notOk(d3a.isEmpty());
  t.end();
});

test("clone", t => {
  const d3a = new Dense3DArray();
  const size = 5;
  iterate3D(size, size, size, (x, y, z) => d3a.set(x, y, z, `${x},${y},${z}`));
  const clone = d3a.clone();
  t.type(clone, Dense3DArray);
  t.notEqual(clone, d3a);
  t.same(clone, d3a);
  t.end();
});
