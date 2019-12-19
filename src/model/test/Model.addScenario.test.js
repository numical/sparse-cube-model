const tap = require("tap");
const Model = require("../Model");
const MappedModel = require("../MappedModel");
const {
  increment,
  interval,
  lookup,
  previous
} = require("../../fns/coreFunctions");
const iterate2D = require("../../data-structures/iterate2D");
const testFixture = require("./testFixture");

[Model, MappedModel].forEach(Type => {
  tap.test(`${Type.name} tests: `, typeTests => {
    const { test, only } = typeTests;
    test("Add scenario with no args throws error", t => {
      const model = testFixture(Type);
      t.throws(
        () => model.addScenario(),
        new Error("A scenario name is required.")
      );
      t.end();
    });

    test("Add scenario with no scenario name throws error", t => {
      const model = testFixture(Type);
      t.throws(
        () => model.addScenario({}),
        new Error("A scenario name is required.")
      );
      t.end();
    });

    test("Add scenario copying unknown scenario throws error", t => {
      const scenarioName = "test scenario";
      const copyOf = "unknown scenario";
      const model = testFixture(Type);
      t.throws(
        () => model.addScenario({ scenarioName, copyOf }),
        new Error(`Unknown scenario '${copyOf}'`)
      );
      t.end();
    });

    test("Add scenario based on empty default", t => {
      const scenarioName = "test scenario";
      const model = new Type();
      model.addScenario({ scenarioName });
      t.end();
    });

    test("Add scenario based on populated default", t => {
      const scenarioName = "test scenario";
      const model = testFixture(Type);
      t.same(model.lengths, { x: 10, y: 4, z: 1 });
      model.addScenario({ scenarioName });
      t.same(model.lengths, { x: 10, y: 4, z: 2 });
      iterate2D(10, 4, (x, y) => {
        t.equal(model[x][y][0], model[x][y][1]);
      });
      t.end();
    });

    test("updateRow of a single scenario works", t => {
      const scenarioName = "test scenario";
      const model = testFixture(Type);
      model.updateRow({
        rowName: "increment row",
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
      const scenarioName = "test scenario";
      const model = testFixture(Type);
      model.addScenario({ scenarioName });
      model.updateRow({
        rowName: "increment row",
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
      const scenarioName = "test scenario";
      const model = testFixture(Type);
      model.addScenario({ scenarioName });
      model.updateRow({
        rowName: "increment row",
        constants: [100],
        fn: increment
      });
      model.updateRow({
        rowName: "independent row",
        scenarioName,
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
      const scenarioNames = ["test scenario 1", "test scenario 2"];
      const model = testFixture(Type);
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
      const model = testFixture(Type);
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
      const model = testFixture(Type);
      model.addScenario({ scenarioName });
      model.deleteRow({ rowName, scenarioName });
      t.same(model.range({ y: 3, z: 0 }), [1000, 0, 1, 2, 3, 4, 5, 6, 7, 8]);
      t.same(model.range({ y: 3, z: 1 }), [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
      t.end();
    });

    test("scenario with unknown name errors", t => {
      const model = new Type({ intervals: { count: 3 } });
      t.throws(
        () => model.scenario({ scenarioName: "unknown" }),
        new Error("Unknown scenario 'unknown'")
      );
      t.end();
    });

    test("scenario with default scenario returns OK", t => {
      const model = new Type({ intervals: { count: 3 } });
      model.addRow({ rowName: "default scenario row", fn: interval });
      t.same(model.scenario(), [[0, 1, 2]]);
      t.end();
    });

    test("scenario with default empty scenario returns empty array", t => {
      const model = new Type({ intervals: { count: 3 } });
      t.same(model.scenario(), []);
      t.end();
    });

    test("scenario returns scenario values", t => {
      const model = new Type({ intervals: { count: 3 } });
      model.addRow({ rowName: "default scenario row", fn: interval });
      const scenarioName = "scenario 1";
      const rowNames = ["row 0", "row 1", "row 2"];
      const fn = ({ scenario, row }, index) =>
        `${index},${row.index},${scenario.index}`;
      fn.key = "testfn";
      model.addScenario({ scenarioName });
      rowNames.forEach(rowName => {
        model.addRow({
          scenarioName,
          rowName,
          fn
        });
      });

      const scenario1 = model.scenario({ scenarioName });
      t.same(scenario1, [
        [0, 1, 2],
        ["0,1,1", "1,1,1", "2,1,1"],
        ["0,2,1", "1,2,1", "2,2,1"],
        ["0,3,1", "1,3,1", "2,3,1"]
      ]);

      t.end();
    });

    test("Add scenario based on empty default", t => {
      const scenarioName = "test scenario";
      const model = new Type({ intervals: { count: 3 } });
      model.addScenario({ scenarioName });
      t.same(model.scenario({ scenarioName }), []);
      t.end();
    });

    test("Mutating a scenario based on an empty default is fine", t => {
      const scenarioName = "test scenario";
      const model = new Type({ intervals: { count: 3 } });
      model.addScenario({ scenarioName });
      model.addRow({
        scenarioName,
        rowName: "row 0",
        fn: previous,
        constants: [5, 6]
      });
      model.addRow({
        scenarioName,
        rowName: "row 1",
        fn: lookup,
        dependsOn: "row 0"
      });
      t.same(model.scenario({ scenarioName }), [
        [5, 6, 6],
        [5, 6, 6]
      ]);
      // and default is still fine
      t.same(model.scenario({ scenarioName: "defaultScenario" }), [
        [0, 0, 0],
        [0, 0, 0]
      ]);
      t.end();
    });

    test("Mutating then updating a scenario based on an empty default is fine", t => {
      const scenarioName = "test scenario";
      const model = new Type({ intervals: { count: 3 } });
      model.addScenario({ scenarioName });
      model.addRow({
        scenarioName,
        rowName: "row 0",
        fn: previous,
        constants: [5, 6]
      });
      model.addRow({
        scenarioName,
        rowName: "row 1",
        fn: lookup,
        fnArgs: { reference: "row 0" },
        dependsOn: "row 0"
      });
      model.updateRow({
        scenarioName,
        rowName: "row 0",
        fn: increment,
        constants: [1]
      });
      t.same(model.scenario({ scenarioName }), [
        [1, 2, 3],
        [1, 2, 3]
      ]);
      t.same(model.scenario({ scenarioName: "defaultScenario" }), [
        [0, 0, 0],
        [0, 0, 0]
      ]);
      t.end();
    });

    test("scenario returns scenario values with multiple scenarios", t => {
      const model = new Type({ intervals: { count: 3 } });
      model.addRow({ rowName: "default scenario row", fn: interval });
      const rowNames = ["row 0", "row 1", "row 2"];
      const fn = ({ scenario, row }, index) =>
        `${index},${row.index},${scenario.index}`;
      fn.key = "testfn";
      model.addScenario({ scenarioName: "scenario 1" });
      rowNames.forEach(rowName => {
        model.addRow({
          scenarioName: "scenario 1",
          rowName,
          fn
        });
      });
      model.addScenario({ scenarioName: "scenario 2", copyOf: "scenario 1" });

      const scenario1 = model.scenario({ scenarioName: "scenario 1" });
      t.same(scenario1, [
        [0, 1, 2],
        ["0,1,1", "1,1,1", "2,1,1"],
        ["0,2,1", "1,2,1", "2,2,1"],
        ["0,3,1", "1,3,1", "2,3,1"]
      ]);

      const scenario2 = model.scenario({ scenarioName: "scenario 2" });
      t.same(scenario2, [
        [0, 1, 2],
        ["0,1,2", "1,1,2", "2,1,2"],
        ["0,2,2", "1,2,2", "2,2,2"],
        ["0,3,2", "1,3,2", "2,3,2"]
      ]);

      t.end();
    });

    test("scenario returns scenario values with multiple scenarios, empty default scenario", t => {
      const model = new Type({ intervals: { count: 3 } });
      const rowNames = ["row 0", "row 1", "row 2"];
      const fn = ({ scenario, row }, index) =>
        `${index},${row.index},${scenario.index}`;
      fn.key = "testfn";
      model.addScenario({ scenarioName: "scenario 1" });
      rowNames.forEach(rowName => {
        model.addRow({
          scenarioName: "scenario 1",
          rowName,
          fn
        });
      });
      model.addScenario({ scenarioName: "scenario 2", copyOf: "scenario 1" });

      const scenario1 = model.scenario({ scenarioName: "scenario 1" });
      t.same(scenario1, [
        ["0,0,1", "1,0,1", "2,0,1"],
        ["0,1,1", "1,1,1", "2,1,1"],
        ["0,2,1", "1,2,1", "2,2,1"]
      ]);

      const scenario2 = model.scenario({ scenarioName: "scenario 2" });
      t.same(scenario2, [
        ["0,0,2", "1,0,2", "2,0,2"],
        ["0,1,2", "1,1,2", "2,1,2"],
        ["0,2,2", "1,2,2", "2,2,2"]
      ]);

      t.end();
    });

    typeTests.end();
  });
});
