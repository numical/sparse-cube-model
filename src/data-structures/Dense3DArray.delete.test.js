const { test, only } = require("tap");
const Dense3DArray = require("./Dense3DArray");
const iterate3D = require("./iterate3D");

const setUp = () => {
  const d3a = new Dense3DArray();
  iterate3D(5, 5, 5, (x, y, z) => d3a.set(x, y, z, `${x},${y},${z}`));
  return d3a;
};

test("test setup", t => {
  const d3a = setUp();
  t.same(d3a.range({ y: 0, z: 0 }), [
    "0,0,0",
    "1,0,0",
    "2,0,0",
    "3,0,0",
    "4,0,0"
  ]);
  t.end();
});

test("delete errors if no args sent", t => {
  const d3a = setUp();
  t.throws(() => d3a.delete(), new Error("Number of indices must be 1."));
  t.end();
});

test("delete errors if empty args sent", t => {
  const d3a = setUp();
  t.throws(() => d3a.delete({}), new Error("Number of indices must be 1."));
  t.end();
});

test("delete errors if more than 1 index sent", t => {
  const d3a = setUp();
  t.throws(
    () => d3a.delete({ x: 0, y: 0 }),
    new Error("Number of indices must be 1.")
  );
  t.end();
});

test("delete errors if out of range index sent", t => {
  const d3a = setUp();
  t.throws(() => d3a.delete({ x: 5 }), RangeError);
  t.end();
});

test("delete first x", t => {
  const d3a = setUp();
  d3a.delete({ x: 0 });
  t.same(d3a.range({ y: 0, z: 0 }), ["1,0,0", "2,0,0", "3,0,0", "4,0,0"]);
  t.same(d3a.range({ y: 4, z: 4 }), ["1,4,4", "2,4,4", "3,4,4", "4,4,4"]);
  t.same(d3a.lengths, { x: 4, y: 5, z: 5 });
  t.end();
});

test("delete middle x", t => {
  const d3a = setUp();
  d3a.delete({ x: 2 });
  t.same(d3a.range({ y: 0, z: 0 }), ["0,0,0", "1,0,0", "3,0,0", "4,0,0"]);
  t.same(d3a.range({ y: 4, z: 4 }), ["0,4,4", "1,4,4", "3,4,4", "4,4,4"]);
  t.same(d3a.lengths, { x: 4, y: 5, z: 5 });
  t.end();
});

test("delete last x", t => {
  const d3a = setUp();
  d3a.delete({ x: 4 });
  t.same(d3a.range({ y: 0, z: 0 }), ["0,0,0", "1,0,0", "2,0,0", "3,0,0"]);
  t.same(d3a.range({ y: 4, z: 4 }), ["0,4,4", "1,4,4", "2,4,4", "3,4,4"]);
  t.same(d3a.lengths, { x: 4, y: 5, z: 5 });
  t.end();
});

test("delete first y", t => {
  const d3a = setUp();
  d3a.delete({ y: 0 });
  t.same(d3a.range({ x: 0, z: 0 }), ["0,1,0", "0,2,0", "0,3,0", "0,4,0"]);
  t.same(d3a.range({ x: 4, z: 4 }), ["4,1,4", "4,2,4", "4,3,4", "4,4,4"]);
  t.same(d3a.lengths, { x: 5, y: 4, z: 5 });
  t.end();
});

test("delete middle y", t => {
  const d3a = setUp();
  d3a.delete({ y: 2 });
  t.same(d3a.range({ x: 0, z: 0 }), ["0,0,0", "0,1,0", "0,3,0", "0,4,0"]);
  t.same(d3a.range({ x: 4, z: 4 }), ["4,0,4", "4,1,4", "4,3,4", "4,4,4"]);
  t.same(d3a.lengths, { x: 5, y: 4, z: 5 });
  t.end();
});

test("delete end y", t => {
  const d3a = setUp();
  d3a.delete({ y: 4 });
  t.same(d3a.range({ x: 0, z: 0 }), ["0,0,0", "0,1,0", "0,2,0", "0,3,0"]);
  t.same(d3a.range({ x: 4, z: 4 }), ["4,0,4", "4,1,4", "4,2,4", "4,3,4"]);
  t.same(d3a.lengths, { x: 5, y: 4, z: 5 });
  t.end();
});

test("delete first z", t => {
  const d3a = setUp();
  d3a.delete({ z: 0 });
  t.same(d3a.range({ x: 0, y: 0 }), ["0,0,1", "0,0,2", "0,0,3", "0,0,4"]);
  t.same(d3a.range({ x: 4, y: 4 }), ["4,4,1", "4,4,2", "4,4,3", "4,4,4"]);
  t.same(d3a.lengths, { x: 5, y: 5, z: 4 });
  t.end();
});

test("delete middle z", t => {
  const d3a = setUp();
  d3a.delete({ z: 2 });
  t.same(d3a.range({ x: 0, y: 0 }), ["0,0,0", "0,0,1", "0,0,3", "0,0,4"]);
  t.same(d3a.range({ x: 4, y: 4 }), ["4,4,0", "4,4,1", "4,4,3", "4,4,4"]);
  t.same(d3a.lengths, { x: 5, y: 5, z: 4 });
  t.end();
});

test("delete end z", t => {
  const d3a = setUp();
  d3a.delete({ z: 4 });
  t.same(d3a.range({ x: 0, y: 0 }), ["0,0,0", "0,0,1", "0,0,2", "0,0,3"]);
  t.same(d3a.range({ x: 4, y: 4 }), ["4,4,0", "4,4,1", "4,4,2", "4,4,3"]);
  t.same(d3a.lengths, { x: 5, y: 5, z: 4 });
  t.end();
});

test("delete only row of x dimension", t => {
  const d3a = new Dense3DArray();
  d3a.set(0, 1, 1, "only value");
  d3a.delete({ x: 0 });
  t.ok(d3a.isEmpty());
  t.throws(() => d3a.range({ y: 0, z: 0 }), RangeError);
  t.same(d3a.lengths, { x: 0, y: 0, z: 0 });
  t.end();
});

test("delete only row of y dimension", t => {
  const d3a = new Dense3DArray();
  d3a.set(1, 0, 1, "only value");
  d3a.delete({ y: 0 });
  t.ok(d3a.isEmpty());
  t.throws(() => d3a.range({ x: 0, z: 0 }), RangeError);
  t.same(d3a.lengths, { x: 0, y: 0, z: 0 });
  t.end();
});

test("delete only row of z dimension", t => {
  const d3a = new Dense3DArray();
  d3a.set(1, 1, 0, "only value");
  d3a.delete({ z: 0 });
  t.ok(d3a.isEmpty());
  t.throws(() => d3a.range({ x: 0, z: 0 }), RangeError);
  t.same(d3a.lengths, { x: 0, y: 0, z: 0 });
  t.end();
});
