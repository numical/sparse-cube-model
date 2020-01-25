const { test } = require("tap");
const sortByDependency = require("../sortByDependency");

test("sortByDependency does not sort empty elements", t => {
  const row1 = {};
  const row2 = {};
  t.equal(sortByDependency(row1, row2), 0);
  t.end();
});

test("sortByDependency does not sort elements with no depends on", t => {
  const row1 = { rowKey: "row1" };
  const row2 = { rowKey: "row2" };
  t.equal(sortByDependency(row1, row2), 0);
  t.end();
});

test("sortByDependency does not sort elements with different depends on objects", t => {
  const row1 = { rowKey: "row1", dependsOn: { 1: "row3", 2: "row4" } };
  const row2 = { rowKey: "row2", dependsOn: { 1: "row3", 2: "row4" } };
  t.equal(sortByDependency(row1, row2), 0);
  t.end();
});

test("sortByDependency sorts elements with depends on objects", t => {
  const row1 = { rowKey: "row1", dependsOn: { 1: "row3", 2: "row4" } };
  const row2 = { rowKey: "row2", dependsOn: { 1: "row1", 2: "row4" } };
  t.equal(sortByDependency(row1, row2), -1);
  t.end();
});

test("sortByDependency inverse sorts elements with depends on objects", t => {
  const row1 = { rowKey: "row1", dependsOn: { 1: "row3", 2: "row2" } };
  const row2 = { rowKey: "row2", dependsOn: { 1: "row3", 2: "row4" } };
  t.equal(sortByDependency(row1, row2), 1);
  t.end();
});
