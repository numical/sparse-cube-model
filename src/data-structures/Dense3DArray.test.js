const { test, only } = require("tap");
const Dense3DArray = require("./Dense3DArray");
const iterate3D = require("./iterate3D");

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

test("Single element array created by set", t => {
  const value = 7;
  const d3a = new Dense3DArray();
  const { get, set, lengths } = d3a;
  set(0, 0, 0, value);
  t.equals(get(0, 0, 0), value);
  t.equals(d3a[0][0][0], value);
  t.same(lengths, { x: 1, y: 1, z: 1 });
  t.end();
});

test("square of size 2 created by set using default z", t => {
  const value = 7;
  const defaultValue = 9;
  const d3a = new Dense3DArray({ defaultValue });
  const { get, set, lengths } = d3a;
  set(1, 1, 0, value);
  t.equals(get(0, 0, 0), defaultValue);
  t.equals(get(0, 1, 0), defaultValue);
  t.equals(get(1, 0, 0), defaultValue);
  t.equals(get(1, 1, 0), value);
  t.equals(d3a[0][0][0], defaultValue);
  t.equals(d3a[0][1][0], defaultValue);
  t.equals(d3a[1][0][0], defaultValue);
  t.equals(d3a[1][1][0], value);
  t.same(lengths, { x: 2, y: 2, z: 1 });
  t.end();
});

test("cube of size 2 created by set using default value", t => {
  const value = 7;
  const d3a = new Dense3DArray();
  const { get, set, lengths } = d3a;
  set(1, 1, 1, value);
  t.equals(get(0, 0, 0), 0);
  t.equals(get(0, 0, 1), 0);
  t.equals(get(0, 1, 0), 0);
  t.equals(get(0, 1, 1), 0);
  t.equals(get(1, 0, 0), 0);
  t.equals(get(1, 0, 1), 0);
  t.equals(get(1, 1, 0), 0);
  t.equals(get(1, 1, 1), value);
  t.equals(d3a[0][0][0], 0);
  t.equals(d3a[0][0][1], 0);
  t.equals(d3a[0][1][1], 0);
  t.equals(d3a[1][0][0], 0);
  t.equals(d3a[1][0][1], 0);
  t.equals(d3a[1][1][0], 0);
  t.equals(d3a[1][1][1], value);
  t.throws(get.bind(null, 2, 1), RangeError);
  t.same(lengths, { x: 2, y: 2, z: 2 });
  t.end();
});

test("square becomes cube by successive sets", t => {
  const value = 7;
  const d3a = new Dense3DArray();
  const { get, set, lengths } = d3a;
  set(1, 1, 0, value);
  t.same(lengths, { x: 2, y: 2, z: 1 });
  set(1, 1, 1, value);
  t.same(lengths, { x: 2, y: 2, z: 2 });
  t.end();
});

test("successive sets increase size irregularly", t => {
  const value = 7;
  const d3a = new Dense3DArray();
  const { set, lengths } = d3a;
  set(0, 1, 0, value);
  t.same(lengths, { x: 1, y: 2, z: 1 });
  set(1, 1, 0, value);
  t.same(lengths, { x: 2, y: 2, z: 1 });
  set(1, 3, 0, value);
  t.same(lengths, { x: 2, y: 4, z: 1 });
  t.end();
});

test("small irregular size still dense", t => {
  const value = 7;
  const d3a = new Dense3DArray();
  const { set } = d3a;
  set(0, 1, 0, value);
  t.equals(d3a[0][0][0], 0);
  t.equals(d3a[0][1][0], value);
  t.end();
});

test("medium irregular size still dense", t => {
  const value = 7;
  const d3a = new Dense3DArray();
  const { get, set } = d3a;
  set(1, 3, 0, value);
  t.equals(d3a[0][0][0], 0);
  t.equals(d3a[1][0][0], 0);
  t.equals(d3a[0][1][0], 0);
  t.equals(d3a[0][2][0], 0);
  t.equals(d3a[0][3][0], 0);
  t.equals(d3a[1][0][0], 0);
  t.equals(d3a[1][1][0], 0);
  t.equals(d3a[1][2][0], 0);
  t.equals(d3a[1][3][0], value);
  t.end();
});

test("large irregular size still dense", t => {
  const x = 11;
  const y = 27;
  const z = 19;
  const defaultValue = 9;
  const value = 7;
  const d3a = new Dense3DArray({ defaultValue });
  const { get, set, lengths } = d3a;
  set(x, y, z, value);
  for (let i = 0; i <= x; i++) {
    for (let j = 0; j <= y; j++) {
      for (let k = 0; k < z; k++) {
        const expected = i === x && j == y && k == z ? value : defaultValue;
        t.equals(d3a[i][j][k], expected);
      }
    }
  }
  t.same(lengths, { x: x + 1, y: y + 1, z: z + 1 });
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

test("range throws error if at least one index is not defined", t => {
  const { range } = new Dense3DArray();
  t.throws(() => range());
  t.throws(() => range({}));
  t.throws(() => range({ a: 2 }));
  t.end();
});

test("range throws error if indices bigger than the size", t => {
  const { set, range } = new Dense3DArray();
  set(1, 1, 1, 3);
  t.throws(() => range({ x: 2, y: 1 }));
  t.throws(() => range({ x: 0, z: 2 }));
  t.throws(() => range({ y: 2, z: 0 }));
  t.end();
});

test("range returns correct values for two indices", t => {
  const { set, range } = new Dense3DArray();
  iterate3D(4, 3, 2, (x, y, z) => set(x, y, z, `${x},${y},${z}`));

  t.same(range({ y: 1, z: 1 }), ["0,1,1", "1,1,1", "2,1,1", "3,1,1"]);
  t.same(range({ x: 1, z: 1 }), ["1,0,1", "1,1,1", "1,2,1"]);
  t.same(range({ x: 3, y: 2 }), ["3,2,0", "3,2,1"]);
  t.end();
});

test("range returns correct values for one index", t => {
  const { set, range } = new Dense3DArray();
  iterate3D(4, 3, 2, (x, y, z) => set(x, y, z, `${x},${y},${z}`));

  t.same(range({ x: 1 }), [
    ["1,0,0", "1,0,1"],
    ["1,1,0", "1,1,1"],
    ["1,2,0", "1,2,1"]
  ]);

  t.same(range({ y: 1 }), [
    ["0,1,0", "0,1,1"],
    ["1,1,0", "1,1,1"],
    ["2,1,0", "2,1,1"],
    ["3,1,0", "3,1,1"]
  ]);

  t.same(range({ z: 1 }), [
    ["0,0,1", "0,1,1", "0,2,1"],
    ["1,0,1", "1,1,1", "1,2,1"],
    ["2,0,1", "2,1,1", "2,2,1"],
    ["3,0,1", "3,1,1", "3,2,1"]
  ]);

  t.end();
});

test("clone", t => {
  const d3a = new Dense3DArray();
  const size = 5;
  iterate3D(size, (x, y, z) => d3a.set(x, y, z, `${x},${y},${z}`));
  const clone = d3a.clone();
  t.type(clone, Dense3DArray);
  t.notEqual(clone, d3a);
  t.same(clone, d3a);
  t.end();
});