const { test } = require("tap");
const Model = require("./Model");
const { increment } = require("../fns/coreFunctions");
const iterate2D = require("../data-structures/iterate2D");
const testFixture = require("./testFixture");

test("Add scenario with no args throws error", t => {
  const { model } = testFixture();
  t.throws(
    () => model.addScenario(),
    new Error("A scenario name is required.")
  );
  t.end();
});

test("Add scenario with no scenario name throws error", t => {
  const { model } = testFixture();
  t.throws(
    () => model.addScenario({}),
    new Error("A scenario name is required.")
  );
  t.end();
});

test("Add scenario copying unknown scenario throws error", t => {
  const scenarioName = "test scenario";
  const copyOf = "unknown scenario";
  const { model } = testFixture();
  t.throws(
    () => model.addScenario({ scenarioName, copyOf }),
    new Error(`Unknown scenario '${copyOf}'`)
  );
  t.end();
});

test("Add scenario based on empty default", t => {
  const scenarioName = "test scenario";
  const model = new Model();
  model.addScenario({ scenarioName });
  t.end();
});

test("Add scenario based on default", t => {
  const scenarioName = "test scenario";
  const { model } = testFixture();
  t.same(model.lengths, { x: 10, y: 4, z: 1 });
  model.addScenario({ scenarioName });
  t.same(model.lengths, { x: 10, y: 4, z: 2 });
  iterate2D(10, 4, (x, y) => {
    t.equal(model[x][y][0], model[x][y][1]);
  });
  t.end();
});

test("Ensure added scenario is independent", t => {
  const scenarioName = "test scenario";
  const { model } = testFixture();
  model.addScenario({ scenarioName });
  model.updateRow({
    rowName: "increment row",
    constants: [10]
  });
  model.updateRow({
    rowName: "independent row",
    scenarioName,
    constants: [100]
  });
  // original constants independent
  t.equal(model[0][0][0], 10);
  t.equal(model[0][0][1], 0);
  // derived values independent
  t.equal(model[9][0][0], 19);
  t.equal(model[9][0][1], 9);
  // lookup values independent
  t.equal(model[9][1][0], 19);
  t.equal(model[9][1][1], 9);
  // copied constants independent
  t.equal(model[0][2][0], 10);
  t.equal(model[0][2][1], 100);
  t.end();
});

test("Add scenario based on another scenario", t => {
  const scenarioNames = ["test scenario 1", "test scenario 2"];
  const { model } = testFixture();
  t.same(model.lengths, { x: 10, y: 4, z: 1 });
  scenarioNames.forEach(scenarioName => {
    model.addScenario({ scenarioName });
  });
  t.same(model.lengths, { x: 10, y: 4, z: 3 });
  iterate2D(10, 4, (x, y) => {
    t.equal(model[x][y][0], model[x][y][1]);
    t.equal(model[x][y][1], model[x][y][2]);
  });
  t.end();
});

test("Mutator operations work on new scenario", t => {
  const scenarioName = "test scenario";
  const rowName = "test row";
  const { model } = testFixture();
  model.addScenario({ scenarioName });
  model.updateRow({
    rowName: "increment row",
    scenarioName,
    constants: [100],
    fn: increment
  });
  t.same(model.range({ y: 0, z: 1 }), [
    100,
    101,
    102,
    103,
    104,
    105,
    106,
    107,
    108,
    109
  ]);
  model.addRow({ rowName, scenarioName, constants: [5], fn: increment });
  t.same(model.range({ y: 4, z: 1 }), [5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
  t.end();
});

test("Delete row affects only the passed scenario", t => {
  const scenarioName = "test scenario";
  const rowName = "second lookup row";
  const { model } = testFixture();
  model.addScenario({ scenarioName });
  model.deleteRow({ rowName, scenarioName });
  t.same(model.range({ y: 3, z: 0 }), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  t.same(model.range({ y: 3, z: 1 }), [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  t.end();
});
