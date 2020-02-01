const {
  emptyScenarios,
  populatedScenarios
} = require("../../test/testScaffold");

populatedScenarios((test, setUpFn, fixture) => {
  test("Delete scenario with no arg throws error", t => {
    const model = setUpFn();
    t.throws(
      () => model.deleteScenario(),
      new Error("A scenario key is required.")
    );
    t.end();
  });

  test("Delete scenario with unknown scenario key throws error", t => {
    const model = setUpFn();
    t.throws(
      () => model.deleteScenario({ scenarioKey: "unknown scenario" }),
      new Error("Unknown scenario 'unknown scenario'")
    );
    t.end();
  });

  test("Delete scenario", t => {
    const model = setUpFn();
    const scenarioKey = "second scenario";
    model.addScenario({ scenarioKey });
    t.same(model.lengths, fixture.expectedLengths(0, 0, 1));
    model.deleteScenario({ scenarioKey });
    t.same(model.lengths, fixture.expectedLengths());
    t.throws(
      () => model.addRow({ rowKey: "test row", scenarioKey }),
      new Error(`Unknown scenario '${scenarioKey}'`)
    );
    t.end();
  });
});

emptyScenarios((test, setUpFn) => {
  test("Delete only scenario throws error", t => {
    const model = setUpFn();
    t.throws(
      () => model.deleteScenario({ scenarioKey: "defaultScenario" }),
      new Error("Cannot delete only scenario 'defaultScenario'.")
    );
    t.end();
  });

  test("Can delete default scenario if another is available", t => {
    const model = setUpFn();
    model.addScenario({ scenarioKey: "second scenario" });
    const scenarioKey = "defaultScenario";
    model.deleteScenario({ scenarioKey });
    t.same(model.lengths, { x: 0, y: 0, z: 0 });
    t.throws(
      () => model.addRow({ rowKey: "test row" }),
      new Error(`Unknown scenario '${scenarioKey}'`)
    );
    t.end();
  });

  test("Can re-add default scenario", t => {
    const model = setUpFn();
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

  test("Can delete non-default scenario on empty model", t => {
    const model = setUpFn();
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
