const { test, only } = require("tap");
const Dense3DArray = require("../Dense3DArray");
const iterate3D = require("../iterate3D");

test("Single element array created by set", t => {
  const value = 7;
  const d3a = new Dense3DArray();
  const { get, set, lengths } = d3a;
  set(0, 0, 0, value);
  t.equal(get(0, 0, 0), value);
  t.equal(d3a[0][0][0], value);
  t.same(lengths, { x: 1, y: 1, z: 1 });
  t.end();
});

test("square of size 2 created by set using default z", t => {
  const value = 7;
  const defaultValue = 9;
  const d3a = new Dense3DArray({ defaultValue });
  const { get, set, lengths } = d3a;
  set(1, 1, 0, value);
  t.equal(get(0, 0, 0), defaultValue);
  t.equal(get(0, 1, 0), defaultValue);
  t.equal(get(1, 0, 0), defaultValue);
  t.equal(get(1, 1, 0), value);
  t.equal(d3a[0][0][0], defaultValue);
  t.equal(d3a[0][1][0], defaultValue);
  t.equal(d3a[1][0][0], defaultValue);
  t.equal(d3a[1][1][0], value);
  t.same(lengths, { x: 2, y: 2, z: 1 });
  t.end();
});

test("cube of size 2 created by set using default value", t => {
  const value = 7;
  const d3a = new Dense3DArray();
  const { get, set, lengths } = d3a;
  set(1, 1, 1, value);
  t.equal(get(0, 0, 0), 0);
  t.equal(get(0, 0, 1), 0);
  t.equal(get(0, 1, 0), 0);
  t.equal(get(0, 1, 1), 0);
  t.equal(get(1, 0, 0), 0);
  t.equal(get(1, 0, 1), 0);
  t.equal(get(1, 1, 0), 0);
  t.equal(get(1, 1, 1), value);
  t.equal(d3a[0][0][0], 0);
  t.equal(d3a[0][0][1], 0);
  t.equal(d3a[0][1][1], 0);
  t.equal(d3a[1][0][0], 0);
  t.equal(d3a[1][0][1], 0);
  t.equal(d3a[1][1][0], 0);
  t.equal(d3a[1][1][1], value);
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
  t.equal(d3a[0][0][0], 0);
  t.equal(d3a[0][1][0], value);
  t.end();
});

test("medium irregular size still dense", t => {
  const value = 7;
  const d3a = new Dense3DArray();
  const { get, set } = d3a;
  set(1, 3, 0, value);
  t.equal(d3a[0][0][0], 0);
  t.equal(d3a[1][0][0], 0);
  t.equal(d3a[0][1][0], 0);
  t.equal(d3a[0][2][0], 0);
  t.equal(d3a[0][3][0], 0);
  t.equal(d3a[1][0][0], 0);
  t.equal(d3a[1][1][0], 0);
  t.equal(d3a[1][2][0], 0);
  t.equal(d3a[1][3][0], value);
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
        t.equal(d3a[i][j][k], expected);
      }
    }
  }
  t.same(lengths, { x: x + 1, y: y + 1, z: z + 1 });
  t.end();
});
