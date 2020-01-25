const {
  emptyScenarios,
  populatedScenarios
} = require("../../test/testScaffold");
const {
  increment,
  interval,
  lookup,
  previous
} = require("../../../fns/lookupFunctions");
const iterate2D = require("../../../data-structures/iterate2D");

populatedScenarios((test, setupFn) => {
  test("Add scenario with no args throws error", t => {
    const model = setupFn();
    t.throws(
      () => model.addScenario(),
      new Error("A scenario key is required.")
    );
    t.end();
  });

  test("Add scenario with no scenario key throws error", t => {
    const model = setupFn();
    t.throws(
      () => model.addScenario({}),
      new Error("A scenario key is required.")
    );
    t.end();
  });

  test("Add scenario with same key as existing scenario throws error", t => {
    const model = setupFn();
    const scenarioKey = "test scenario";
    model.addScenario({ scenarioKey });
    t.throws(
      () => model.addScenario({ scenarioKey }),
      new Error("Scenario 'test scenario' already exists.")
    );
    t.end();
  });

  test("Add scenario copying unknown scenario throws error", t => {
    const scenarioKey = "test scenario";
    const baseScenarioKey = "unknown scenario";
    const model = setupFn();
    t.throws(
      () => model.addScenario({ scenarioKey, baseScenarioKey }),
      new Error(`Unknown scenario '${baseScenarioKey}'`)
    );
    t.end();
  });

  test("Add scenario based on populated default", t => {
    const scenarioKey = "test scenario";
    const model = setupFn();
    t.same(model.lengths, { x: 10, y: 4, z: 1 });
    model.addScenario({ scenarioKey });
    t.same(model.lengths, { x: 10, y: 4, z: 2 });
    iterate2D(10, 4, (x, y) => {
      t.equal(model[x][y][0], model[x][y][1]);
    });
    t.end();
  });

  test("updateRow of a single scenario works", t => {
    const scenarioKey = "test scenario";
    const model = setupFn();
    model.updateRow({
      rowKey: "increment row",
      constants: [100],
      fn: increment
    });

    t.equal(model[0][0][0], 100);
    t.equal(model[9][0][0], 109);
    t.equal(model[0][1][0], 100);
    t.equal(model[9][1][0], 109);
    t.equal(model[0][2][0], 10);
    t.equal(model[9][2][0], 19);

    t.end();
  });

  test("Adding a scenario does not affect updates of the original scenario", t => {
    const scenarioKey = "test scenario";
    const model = setupFn();
    model.addScenario({ scenarioKey });
    model.updateRow({
      rowKey: "increment row",
      constants: [100],
      fn: increment
    });

    t.equal(model[0][0][0], 100);
    t.equal(model[9][0][0], 109);
    t.equal(model[0][1][0], 100);
    t.equal(model[9][1][0], 109);
    t.equal(model[0][2][0], 10);
    t.equal(model[9][2][0], 19);

    t.end();
  });

  test("Ensure added scenario is independent", t => {
    const scenarioKey = "test scenario";
    const model = setupFn();
    model.addScenario({ scenarioKey });
    model.updateRow({
      rowKey: "increment row",
      constants: [100],
      fn: increment
    });
    model.updateRow({
      rowKey: "independent row",
      scenarioKey,
      constants: [1000],
      fn: increment
    });

    // default scenario
    t.equal(model[0][0][0], 100);
    t.equal(model[9][0][0], 109);
    t.equal(model[0][1][0], 100);
    t.equal(model[9][1][0], 109);
    t.equal(model[0][2][0], 10);
    t.equal(model[9][2][0], 19);

    // test scenario
    t.equal(model[0][0][1], 0);
    t.equal(model[9][0][1], 9);
    t.equal(model[0][1][1], 0);
    t.equal(model[9][1][1], 9);
    t.equal(model[0][2][1], 1000);
    t.equal(model[9][2][1], 1009);

    t.end();
  });

  test("Add scenario based on another scenario", t => {
    const scenarioKeys = ["test scenario 1", "test scenario 2"];
    const model = setupFn();
    t.same(model.lengths, { x: 10, y: 4, z: 1 });
    scenarioKeys.forEach(scenarioKey => {
      model.addScenario({ scenarioKey });
    });
    t.same(model.lengths, { x: 10, y: 4, z: 3 });
    iterate2D(10, 4, (x, y) => {
      t.equal(model[x][y][0], model[x][y][1]);
      t.equal(model[x][y][1], model[x][y][2]);
    });
    t.end();
  });

  test("Mutator operations work on new scenario", t => {
    const scenarioKey = "test scenario";
    const rowKey = "test row";
    const model = setupFn();
    model.addScenario({ scenarioKey });
    model.updateRow({
      rowKey: "increment row",
      scenarioKey,
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
    model.addRow({ rowKey, scenarioKey, constants: [5], fn: increment });
    t.same(model.row({ rowKey, scenarioKey }), [
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14
    ]);
    t.end();
  });

  test("Delete row affects only the passed scenario", t => {
    const scenarioKey = "test scenario";
    const rowKey = "second lookup row";
    const model = setupFn();
    model.addScenario({ scenarioKey });
    model.deleteRow({ rowKey, scenarioKey });
    t.same(model.row({ rowKey }), [1000, 0, 1, 2, 3, 4, 5, 6, 7, 8]);
    t.throws(
      () => model.row({ rowKey, scenarioKey }),
      new Error("Unknown row 'second lookup row'")
    );
    t.end();
  });

  test("Delete rows affects only the passed scenario", t => {
    const scenarioKey = "test scenario";
    const rowKeys = ["independent row", "second lookup row"];
    const model = setupFn();
    model.addScenario({ scenarioKey });
    model.deleteRows({ rowKeys, scenarioKey });
    t.same(model.row({ rowKey: "independent row" }), [
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19
    ]);
    t.same(model.row({ rowKey: "second lookup row" }), [
      1000,
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8
    ]);
    t.throws(
      () => model.row({ rowKey: "independent row", scenarioKey }),
      new Error("Unknown row 'independent row'")
    );
    t.throws(
      () => model.row({ rowKey: "second lookup row", scenarioKey }),
      new Error("Unknown row 'second lookup row'")
    );
    t.end();
  });
});

emptyScenarios((test, setupFn) => {
  test("Add scenario based on empty default", t => {
    const scenarioKey = "test scenario";
    const model = setupFn();
    model.addScenario({ scenarioKey });
    t.end();
  });

  test("scenario with unknown key errors", t => {
    const model = setupFn({ intervals: { count: 2 } });
    t.throws(
      () => model.scenario({ scenarioKey: "unknown" }),
      new Error("Unknown scenario 'unknown'")
    );
    t.end();
  });

  test("scenario with default scenario returns OK", t => {
    const model = setupFn({ intervals: { count: 2 } });
    model.addRow({ rowKey: "default scenario row", fn: interval });
    t.same(model.scenario(), [[0, 1, 2]]);
    t.end();
  });

  test("scenario with default empty scenario returns empty array", t => {
    const model = setupFn({ intervals: { count: 2 } });
    t.same(model.scenario(), []);
    t.end();
  });

  test("scenario returns scenario values", t => {
    const model = setupFn({ intervals: { count: 2 } });
    model.addRow({ rowKey: "default scenario row", fn: interval });
    const scenarioKey = "scenario 1";
    const rowKeys = ["row 0", "row 1", "row 2"];
    const fn = ({ scenario, row }, index) =>
      `${index},${row.index},${scenario.index}`;
    fn.key = "testfn";
    model.addScenario({ scenarioKey });
    rowKeys.forEach(rowKey => {
      model.addRow({
        scenarioKey,
        rowKey,
        fn
      });
    });

    const scenario1 = model.scenario({ scenarioKey });
    t.same(scenario1, [
      [0, 1, 2],
      ["0,1,1", "1,1,1", "2,1,1"],
      ["0,2,1", "1,2,1", "2,2,1"],
      ["0,3,1", "1,3,1", "2,3,1"]
    ]);

    t.end();
  });

  test("scenario with 'includeDates' param returns scenario dates and values", t => {
    const model = setupFn({ intervals: { count: 2 } });
    model.addRow({ rowKey: "default scenario row", fn: interval });
    const scenarioKey = "scenario 1";
    model.addScenario({ scenarioKey });

    const scenario1 = model.scenario({ scenarioKey, includeDates: true });
    t.same(scenario1, [
      [new Date(2020, 0, 1), new Date(2020, 1, 1), new Date(2020, 2, 1)],
      [0, 1, 2]
    ]);

    t.end();
  });

  test("Add scenario based on empty default", t => {
    const scenarioKey = "test scenario";
    const model = setupFn({ intervals: { count: 2 } });
    model.addScenario({ scenarioKey });
    t.same(model.scenario({ scenarioKey }), []);
    t.end();
  });

  test("Mutating a scenario based on an empty default is fine", t => {
    const scenarioKey = "test scenario";
    const model = setupFn({ intervals: { count: 2 } });
    model.addScenario({ scenarioKey });
    model.addRow({
      scenarioKey,
      rowKey: "row 0",
      fn: previous,
      constants: [5, 6]
    });
    model.addRow({
      scenarioKey,
      rowKey: "row 1",
      fn: lookup,
      dependsOn: { lookup: "row 0" }
    });
    t.same(model.scenario({ scenarioKey }), [
      [5, 6, 6],
      [5, 6, 6]
    ]);
    // and default is still fine
    t.same(model.scenario({ scenarioKey: "defaultScenario" }), [
      [0, 0, 0],
      [0, 0, 0]
    ]);
    t.end();
  });

  test("Mutating then updating a scenario based on an empty default is fine", t => {
    const scenarioKey = "test scenario";
    const model = setupFn({ intervals: { count: 2 } });
    model.addScenario({ scenarioKey });
    model.addRow({
      scenarioKey,
      rowKey: "row 0",
      fn: previous,
      constants: [5, 6]
    });
    model.addRow({
      scenarioKey,
      rowKey: "row 1",
      fn: lookup,
      fnArgs: { reference: "row 0" },
      dependsOn: { lookup: "row 0" }
    });
    model.updateRow({
      scenarioKey,
      rowKey: "row 0",
      fn: increment,
      constants: [1]
    });
    t.same(model.scenario({ scenarioKey }), [
      [1, 2, 3],
      [1, 2, 3]
    ]);
    t.same(model.scenario({ scenarioKey: "defaultScenario" }), [
      [0, 0, 0],
      [0, 0, 0]
    ]);
    t.end();
  });

  test("scenario returns scenario values with multiple scenarios", t => {
    const model = setupFn({ intervals: { count: 2 } });
    model.addRow({ rowKey: "default scenario row", fn: interval });
    const rowKeys = ["row 0", "row 1", "row 2"];
    const fn = ({ scenario, row }, index) =>
      `${index},${row.index},${scenario.index}`;
    fn.key = "testfn";
    model.addScenario({ scenarioKey: "scenario 1" });
    rowKeys.forEach(rowKey => {
      model.addRow({
        scenarioKey: "scenario 1",
        rowKey,
        fn
      });
    });
    model.addScenario({
      scenarioKey: "scenario 2",
      baseScenarioKey: "scenario 1"
    });

    const scenario1 = model.scenario({ scenarioKey: "scenario 1" });
    t.same(scenario1, [
      [0, 1, 2],
      ["0,1,1", "1,1,1", "2,1,1"],
      ["0,2,1", "1,2,1", "2,2,1"],
      ["0,3,1", "1,3,1", "2,3,1"]
    ]);

    const scenario2 = model.scenario({ scenarioKey: "scenario 2" });
    t.same(scenario2, [
      [0, 1, 2],
      ["0,1,2", "1,1,2", "2,1,2"],
      ["0,2,2", "1,2,2", "2,2,2"],
      ["0,3,2", "1,3,2", "2,3,2"]
    ]);

    t.end();
  });

  test("scenario returns scenario values with multiple scenarios, empty default scenario", t => {
    const model = setupFn({ intervals: { count: 2 } });
    const rowKeys = ["row 0", "row 1", "row 2"];
    const fn = ({ scenario, row }, index) =>
      `${index},${row.index},${scenario.index}`;
    fn.key = "testfn";
    model.addScenario({ scenarioKey: "scenario 1" });
    rowKeys.forEach(rowKey => {
      model.addRow({
        scenarioKey: "scenario 1",
        rowKey,
        fn
      });
    });
    model.addScenario({
      scenarioKey: "scenario 2",
      baseScenarioKey: "scenario 1"
    });

    const scenario1 = model.scenario({ scenarioKey: "scenario 1" });
    t.same(scenario1, [
      ["0,0,1", "1,0,1", "2,0,1"],
      ["0,1,1", "1,1,1", "2,1,1"],
      ["0,2,1", "1,2,1", "2,2,1"]
    ]);

    const scenario2 = model.scenario({ scenarioKey: "scenario 2" });
    t.same(scenario2, [
      ["0,0,2", "1,0,2", "2,0,2"],
      ["0,1,2", "1,1,2", "2,1,2"],
      ["0,2,2", "1,2,2", "2,2,2"]
    ]);
    t.end();
  });
});
