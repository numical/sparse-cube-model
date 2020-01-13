const { test } = require("tap");
const sortByShadows = require("../sortByShadows");

test("sortByShadows", t => {
  const scenario1 = { name: "scenario1" };
  const scenario2 = { name: "scenario2", shadows: { scenario1: {} } };
  const scenario3 = { name: "scenario3", shadows: { scenario2: {} } };
  const unsorted = [scenario2, scenario1, scenario3];
  const sorted = [scenario1, scenario2, scenario3];
  t.same(unsorted.sort(sortByShadows), sorted);
  t.end();
});
