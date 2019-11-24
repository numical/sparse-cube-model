const { test, only } = require("tap");
const Dense3DArray = require("../Dense3DArray");
const iterate3D = require("../iterate3D");

const setUp = () => {
  const d3a = new Dense3DArray();
  iterate3D(3, 3, 3, (x, y, z) => d3a.set(x, y, z, `${x},${y},${z}`));
  return d3a;
};

test("duplicate errors if no args sent", t => {
  const d3a = setUp();
  t.throws(() => d3a.duplicate(), new Error("Number of indices must be 1."));
  t.end();
});

test("duplicate errors if empty args sent", t => {
  const d3a = setUp();
  t.throws(() => d3a.duplicate({}), new Error("Number of indices must be 1."));
  t.end();
});

test("duplicate errors if more than 1 index sent", t => {
  const d3a = setUp();
  t.throws(
    () => d3a.duplicate({ x: 0, y: 0 }),
    new Error("Number of indices must be 1.")
  );
  t.end();
});

test("duplicate errors if out of range index sent", t => {
  const d3a = setUp();
  t.throws(() => d3a.duplicate({ x: 5 }), RangeError);
  t.end();
});

test("duplicate copies whole x dimension to end of array", t => {
  const d3a = setUp();
  t.same(d3a.lengths, { x: 3, y: 3, z: 3 });
  d3a.duplicate({ x: 0 });
  t.same(d3a.lengths, { x: 4, y: 3, z: 3 });
  t.same(d3a.range({ x: 0 }), d3a.range({ x: 3 }));
  t.end();
});

test("duplicate copies whole y dimension to end of array", t => {
  const d3a = setUp();
  t.same(d3a.lengths, { x: 3, y: 3, z: 3 });
  d3a.duplicate({ y: 1 });
  t.same(d3a.lengths, { x: 3, y: 4, z: 3 });
  t.same(d3a.range({ y: 1 }), d3a.range({ y: 3 }));
  t.end();
});

test("duplicate copies whole z dimension to end of array", t => {
  const d3a = setUp();
  t.same(d3a.lengths, { x: 3, y: 3, z: 3 });
  d3a.duplicate({ z: 2 });
  t.same(d3a.lengths, { x: 3, y: 3, z: 4 });
  t.same(d3a.range({ z: 2 }), d3a.range({ z: 3 }));
  t.end();
});
