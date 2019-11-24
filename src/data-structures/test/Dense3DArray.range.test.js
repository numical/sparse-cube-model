const { test, only } = require("tap");
const Dense3DArray = require("../Dense3DArray");
const iterate3D = require("../iterate3D");

test("range throws error if an empty array", t => {
  const { range } = new Dense3DArray();
  t.throws(() => range({ x: 0 }), RangeError);
  t.throws(() => range({ x: 0, y: 0 }), RangeError);
  t.throws(() => range({ x: 0, y: 0, z: 0 }), RangeError);
  t.end();
});

test("range throws error if at least one index is not defined", t => {
  const { range } = new Dense3DArray();
  const expected = new Error("At least one index must be specified.");
  t.throws(() => range(), expected);
  t.throws(() => range({}), expected);
  t.throws(() => range({ a: 2 }), expected);
  t.end();
});

test("range throws error if indices bigger than the size", t => {
  const { set, range } = new Dense3DArray();
  set(1, 1, 1, 3);
  t.throws(() => range({ x: 2 }), RangeError);
  t.throws(() => range({ x: 2, y: 1 }), RangeError);
  t.throws(() => range({ x: 1, y: 2 }), RangeError);
  t.throws(() => range({ z: 2 }), RangeError);
  t.throws(() => range({ x: 2, z: 2 }), RangeError);
  t.throws(() => range({ x: 0, z: 2 }), RangeError);
  t.throws(() => range({ y: 2 }), RangeError);
  t.throws(() => range({ y: 2, z: 0 }), RangeError);
  t.throws(() => range({ y: 1, z: 2 }), RangeError);
  t.end();
});

test("range returns correct value for three indices", t => {
  const { set, range } = new Dense3DArray();
  iterate3D(4, 3, 2, (x, y, z) => set(x, y, z, `${x},${y},${z}`));

  t.same(range({ x: 3, y: 2, z: 1 }), ["3,2,1"]);
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
