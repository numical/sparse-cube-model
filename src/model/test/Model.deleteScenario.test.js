const tap = require("tap");
const Model = require("../Model");
const MappedModel = require("../MappedModel");
const testFixture = require("./testFixture");

[Model, MappedModel].forEach(Type => {
  tap.test(`${Type.name} tests: `, typeTests => {
    const { test, only } = typeTests;
    test("Delete scenario with no arg throws error", t => {
      const { model } = testFixture(Type);
      t.throws(
        () => model.deleteScenario(),
        new Error("A scenario name is required.")
      );
      t.end();
    });

    test("Delete scenario with unknown scenario name throws error", t => {
      const { model } = testFixture(Type);
      t.throws(
        () => model.deleteScenario("unknown scenario"),
        new Error("Unknown scenario 'unknown scenario'")
      );
      t.end();
    });

    test("Delete only scenario throws error", t => {
      const { model } = testFixture(Type);
      t.throws(
        () => model.deleteScenario("defaultScenario"),
        new Error("Cannot delete only scenario 'defaultScenario'.")
      );
      t.end();
    });

    test("Delete scenario", t => {
      const { intervals, model, rows } = testFixture(Type);
      const scenarioName = "ssecond scenario";
      model.addScenario({ scenarioName });
      t.same(model.lengths, { x: intervals.count, y: rows.length, z: 2 });
      model.deleteScenario(scenarioName);
      t.same(model.lengths, { x: intervals.count, y: rows.length, z: 1 });
      t.throws(
        () => model.addRow({ rowName: "test row", scenarioName }),
        new Error(`Unknown scenario '${scenarioName}'`)
      );
      t.end();
    });

    test("Can delete default scenario if another is available", t => {
      const { intervals, model, rows } = testFixture(Type);
      model.addScenario({ scenarioName: "second scenario" });
      const scenarioName = "defaultScenario";
      model.deleteScenario(scenarioName);
      t.same(model.lengths, { x: intervals.count, y: rows.length, z: 1 });
      t.throws(
        () => model.addRow({ rowName: "test row" }),
        new Error(`Unknown scenario '${scenarioName}'`)
      );
      t.end();
    });

    test("Can re-add default scenario", t => {
      const { intervals, model, rows } = testFixture(Type);
      model.addScenario({ scenarioName: "second scenario" });
      t.doesNotThrow(() =>
        model.addScenario({
          scenarioName: "defaultScenario",
          copyOf: "second scenario"
        })
      );
      t.end();
    });

    typeTests.end();
  });
});
