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
      new Error("A scenario key is required.")
    );
    t.end();
  });

  test("Delete scenario with unknown scenario key throws error", t => {
    const model = setUp();
    t.throws(
      () => model.deleteScenario({ scenarioKey: "unknown scenario" }),
      new Error("Unknown scenario 'unknown scenario'")
    );
    t.end();
  });

  test("Delete only scenario throws error", t => {
    const model = setUp();
    t.throws(
      () => model.deleteScenario({ scenarioKey: "defaultScenario" }),
      new Error("Cannot delete only scenario 'defaultScenario'.")
    );
    t.end();
  });

  test("Delete scenario", t => {
    const model = setUp();
    const scenarioKey = "second scenario";
    model.addScenario({ scenarioKey });
    t.same(model.lengths, {
      x: testFixture.meta.intervals.count + 1,
      y: testFixture.rows.length,
      z: 2
    });
    model.deleteScenario({ scenarioKey });
    t.same(model.lengths, {
      x: testFixture.meta.intervals.count + 1,
      y: testFixture.rows.length,
      z: 1
    });
    t.throws(
      () => model.addRow({ rowKey: "test row", scenarioKey }),
      new Error(`Unknown scenario '${scenarioKey}'`)
    );
    t.end();
  });

  test("Can delete default scenario if another is available", t => {
    const model = setUp();
    model.addScenario({ scenarioKey: "second scenario" });
    const scenarioKey = "defaultScenario";
    model.deleteScenario({ scenarioKey });
    t.same(model.lengths, {
      x: testFixture.meta.intervals.count + 1,
      y: testFixture.rows.length,
      z: 1
    });
    t.throws(
      () => model.addRow({ rowKey: "test row" }),
      new Error(`Unknown scenario '${scenarioKey}'`)
    );
    t.end();
  });

  test("Can re-add default scenario", t => {
    const model = setUp();
    model.addScenario({ scenarioKey: "second scenario" });
    model.deleteScenario({ scenarioKey: "defaultScenario" });
    t.doesNotThrow(() =>
      model.addScenario({
        scenarioKey: "defaultScenario",
        baseScenarioKey: "second scenario"
      })
    );
    t.end();
  });
});

emptyScenarios((test, setupFn) => {
  test("Can delete non-default scenario on empty model", t => {
    const model = setupFn();
    const scenarioKey = "test scenario";
    model.addScenario({ scenarioKey });
    t.same(model.scenario({ scenarioKey }), []);
    model.deleteScenario({ scenarioKey });
    t.throws(
      () => model.deleteScenario({ scenarioKey }),
      new Error(`Unknown scenario '${scenarioKey}'`)
    );
    t.end();
  });
});
