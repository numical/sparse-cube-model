const testFixture = require("../../test/testFixture");
const {
  emptyScenarios,
  populatedScenarios
} = require("../../test/testScaffold");

populatedScenarios((test, setUp) => {
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
      () => model.deleteScenario({ scenarioName: "unknown scenario" }),
      new Error("Unknown scenario 'unknown scenario'")
    );
    t.end();
  });

  test("Delete only scenario throws error", t => {
    const model = setUp();
    t.throws(
      () => model.deleteScenario({ scenarioName: "defaultScenario" }),
      new Error("Cannot delete only scenario 'defaultScenario'.")
    );
    t.end();
  });

  test("Delete scenario", t => {
    const model = setUp();
    const scenarioName = "second scenario";
    model.addScenario({ scenarioName });
    t.same(model.lengths, {
      x: testFixture.meta.intervals.count,
      y: testFixture.rows.length,
      z: 2
    });
    model.deleteScenario({ scenarioName });
    t.same(model.lengths, {
      x: testFixture.meta.intervals.count,
      y: testFixture.rows.length,
      z: 1
    });
    t.throws(
      () => model.addRow({ rowName: "test row", scenarioName }),
      new Error(`Unknown scenario '${scenarioName}'`)
    );
    t.end();
  });

  test("Can delete default scenario if another is available", t => {
    const model = setUp();
    model.addScenario({ scenarioName: "second scenario" });
    const scenarioName = "defaultScenario";
    model.deleteScenario({ scenarioName });
    t.same(model.lengths, {
      x: testFixture.meta.intervals.count,
      y: testFixture.rows.length,
      z: 1
    });
    t.throws(
      () => model.addRow({ rowName: "test row" }),
      new Error(`Unknown scenario '${scenarioName}'`)
    );
    t.end();
  });

  test("Can re-add default scenario", t => {
    const model = setUp();
    model.addScenario({ scenarioName: "second scenario" });
    t.doesNotThrow(() =>
      model.addScenario({
        scenarioName: "defaultScenario",
        copyOf: "second scenario"
      })
    );
    t.end();
  });
});

emptyScenarios((test, Type) => {
  test("Can delete non-default scenario on empty model", t => {
    const model = new Type();
    const scenarioName = "test scenario";
    model.addScenario({ scenarioName });
    t.same(model.scenario({ scenarioName }), []);
    model.deleteScenario({ scenarioName });
    t.throws(
      () => model.deleteScenario({ scenarioName }),
      new Error(`Unknown scenario '${scenarioName}'`)
    );
    t.end();
  });
});
