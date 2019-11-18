const { test, only } = require("tap");
const Model = require("./Model");
const increment = require("../fns/increment");
const lookup = require("../fns/lookup");
const iterate2D = require("../data-structures/iterate2D");

const setUp = () => {
  const model = new Model({
    interval: {
      count: 10
    }
  });
  model.addRow({
    rowName: "increment row",
    fn: increment,
    constants: [0]
  });
  model.addScenario({ scenarioName: "second scenario" });
  return model;
};

test("Delete scenario with no arg throws error", t => {
  const model = setUp();
  t.throws(
    () => model.deleteScenario(),
    new Error("A scenario name is required.")
  );
  t.end();
});

test("Delete scenario with unknown scenario name throws error", t => {
  const model = setUp();
  t.throws(
    () => model.deleteScenario("unknown scenario"),
    new Error("Unknown scenario 'unknown scenario'")
  );
  t.end();
});

test("Delete only scenario throws error", t => {
  const model = new Model();
  t.throws(
    () => model.deleteScenario("defaultScenario"),
    new Error("Cannot delete only scenario 'defaultScenario'.")
  );
  t.end();
});

test("Delete scenario", t => {
  const model = setUp();
  const scenarioName = "second scenario";
  t.same(model.lengths, { x: 10, y: 1, z: 2 });
  model.deleteScenario(scenarioName);
  t.same(model.lengths, { x: 10, y: 1, z: 1 });
  t.throws(
    () => model.addRow({ rowName: "test row", scenarioName }),
    new Error(`Unknown scenario '${scenarioName}'`)
  );
  t.end();
});

test("Can delete default scenario if another is available", t => {
  const model = setUp();
  const scenarioName = "defaultScenario";
  model.deleteScenario(scenarioName);
  t.same(model.lengths, { x: 10, y: 1, z: 1 });
  t.throws(
    () => model.addRow({ rowName: "test row" }),
    new Error(`Unknown scenario '${scenarioName}'`)
  );
  t.end();
});
