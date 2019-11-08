const { test } = require("tap");
const Sparse3DArray = require("./Sparse3DArray");

test("Array creation", t => {
  const { get, set, unset, meta } = new Sparse3DArray();
  t.type(get, "function");
  t.type(set, "function");
  t.type(unset, "function");
  t.type(meta, "object");
  t.end();
});

test("Empty", t => {
  const { get, meta } = new Sparse3DArray();
  t.type(get(), "undefined");
  t.type(get(0), "undefined");
  t.type(get(0, 0), "undefined");
  t.type(get(0, 0, 0), "undefined");
  t.type(get(10, 10, 10), "undefined");
  t.same(meta, { objects: 0, values: 0, lengths: { x: 0, y: 0, z: 0 } });
  t.end();
});

test("Single value at (0,0,0)", t => {
  const s3a = new Sparse3DArray();
  const { get, set, meta } = s3a;
  const value = {};
  t.equal(set(0, 0, 0, value), value);
  t.equal(get(0, 0, 0), value);
  t.equal(s3a[0][0][0], value);
  t.type(get(0), "undefined");
  t.type(get(0, 1), "undefined");
  t.type(get(0, 0, 1), "undefined");
  t.same(meta, { objects: 2, values: 1, lengths: { x: 1, y: 1, z: 1 } });
  t.end();
});

test("Single value at (10,10,10)", t => {
  const s3a = new Sparse3DArray();
  const { get, set, meta } = s3a;
  const value = { foo: "bar" };
  t.equal(set(10, 10, 10, value), value);
  t.equal(get(10, 10, 10), value);
  t.equal(s3a[10][10][10], value);
  t.type(get(10, 10, 0), "undefined");
  t.type(get(10, 0, 10), "undefined");
  t.type(get(10, 0, 0), "undefined");
  t.type(get(0, 0, 0), "undefined");
  t.same(meta, { objects: 2, values: 1, lengths: { x: 11, y: 11, z: 11 } });
  t.end();
});

test("Multiple value at different places", t => {
  const s3a = new Sparse3DArray();
  const { get, set, meta } = s3a;
  t.equal(set(3, 5, 7, 1), 1);
  t.equal(set(8, 6, 4, 2), 2);
  t.equal(set(8, 6, 5, 3), 3);
  t.equal(get(3, 5, 7), 1);
  t.equal(s3a[3][5][7], 1);
  t.equal(get(8, 6, 4), 2);
  t.equal(s3a[8][6][4], 2);
  t.equal(get(8, 6, 5), 3);
  t.equal(s3a[8][6][5], 3);
  t.same(meta, { objects: 4, values: 3, lengths: { x: 9, y: 7, z: 8 } });
  t.end();
});

test("Reset single value)", t => {
  const { get, set } = new Sparse3DArray();
  const values = {};
  [1, 2].forEach(value => (values[value] = { value }));
  t.equal(set(5, 5, 5, values[1]), values[1]);
  t.equal(get(5, 5, 5), values[1]);
  t.equal(set(5, 5, 5, values[2]), values[2]);
  t.equal(get(5, 5, 5), values[2]);
  t.end();
});

test("Unset undefined does nothing", t => {
  const { get, unset } = new Sparse3DArray();
  unset(5, 5, 0);
  t.type(get(5, 5, 0), "undefined");
  t.end();
});

test("Unset single value", t => {
  const { get, set, unset, meta } = new Sparse3DArray();
  const value = {};
  set(5, 5, 0, value);
  t.equal(get(5, 5, 0), value);
  t.same(meta, { objects: 2, values: 1, lengths: { x: 6, y: 6, z: 1 } });
  unset(5, 5, 0);
  t.type(get(5, 5, 0), "undefined");
  t.same(meta, { objects: 0, values: 0, lengths: { x: 0, y: 0, z: 0 } });
  t.end();
});

test("Unset from multiple values - metadata", t => {
  const { get, set, unset, meta } = new Sparse3DArray();
  set(1, 0, 0, 1);
  set(0, 2, 0, 2);
  set(0, 0, 3, 3);
  t.same(meta, { objects: 5, values: 3, lengths: { x: 2, y: 3, z: 4 } });
  unset(1, 0, 0);
  t.same(meta, { objects: 3, values: 2, lengths: { x: 1, y: 3, z: 4 } });
  unset(0, 2, 0);
  t.same(meta, { objects: 2, values: 1, lengths: { x: 1, y: 1, z: 4 } });
  unset(0, 0, 3);
  t.same(meta, { objects: 0, values: 0, lengths: { x: 0, y: 0, z: 0 } });
  t.end();
});

test("Unset from multiple overlapping values - metadata", t => {
  const { get, set, unset, meta } = new Sparse3DArray();
  set(3, 5, 7, 1);
  set(7, 5, 4, 2);
  set(8, 6, 5, 3);
  set(8, 6, 6, 4); // for test coverage of 'sort' in maxIndexOfObject
  t.same(meta, { objects: 6, values: 4, lengths: { x: 9, y: 7, z: 8 } });
  unset(3, 5, 7);
  t.same(meta, { objects: 4, values: 3, lengths: { x: 9, y: 7, z: 7 } });
  unset(8, 6, 6);
  unset(8, 6, 5);
  t.same(meta, { objects: 2, values: 1, lengths: { x: 8, y: 6, z: 5 } });
  t.end();
});

test("clone", t => {
  const s3a = new Sparse3DArray();
  s3a.set(3, 5, 7, 1);
  s3a.set(8, 6, 4, 2);
  s3a.set(8, 6, 5, 3);
  const clone = s3a.clone();
  t.type(clone, Sparse3DArray);
  t.notEqual(clone, s3a);
  t.same(clone, s3a);
  t.end();
});
