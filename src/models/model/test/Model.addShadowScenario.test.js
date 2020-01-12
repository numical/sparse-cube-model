const {
  emptyScenarios,
  populatedScenarios
} = require("../../test/testScaffold");
const { increment } = require("../../../fns/lookupFunctions");
const { identity, multiplier } = require("../../../fns/shadowFunctions");
const { defaultScenario } = require("../modelMetadata");

emptyScenarios((test, setupFn, Type) => {
  test("Add shadow scenario must have a shadow function", t => {
    const scenarioName = "test scenario";
    const model = setupFn();
    t.throws(
      () => model.addScenario({ scenarioName, shadowFn: "do it" }),
      new Error("Function 'do it' must be a function.")
    );
    t.end();
  });

  test("Shadow function must have a key", t => {
    const scenarioName = "test scenario";
    const shadowFn = () => 5;
    const model = setupFn();
    t.throws(
      () => model.addScenario({ scenarioName, shadowFn }),
      new Error("Function 'shadowFn' must have a 'key' property.")
    );
    t.end();
  });

  test("Add empty shadow scenario does not error", t => {
    const scenarioName = "test scenario";
    const shadowFn = identity;
    const model = setupFn();
    model.addScenario({ scenarioName, shadowFn });
    t.same(model.lengths, { x: 0, y: 0, z: 0 });
    t.end();
  });

  test("Add empty shadow scenario serializes consistently", t => {
    const scenarioName = "test scenario";
    const shadowFn = identity;
    const pre = setupFn();
    pre.addScenario({ scenarioName, shadowFn });
    const s = pre.stringify();
    const post = Type.parse(s);
    t.same(post, pre);
    t.end();
  });

  test("Add shadow scenario after adding a single row", t => {
    const rowName = "test row";
    const scenarioName = "test scenario";
    const shadowFn = identity;
    const model = setupFn();
    model.addRow({ rowName, fn: increment, constants: [10] });
    t.same(model.lengths, { x: 10, y: 1, z: 1 });
    t.same(model.row({ rowName }), [10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
    model.addScenario({ scenarioName, shadowFn });
    t.same(model.lengths, { x: 10, y: 1, z: 2 });
    t.same(model.row({ rowName, scenarioName }), [
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
    t.end();
  });

  test("Add single row after adding shadow scenario", t => {
    const rowName = "test row";
    const scenarioName = "test scenario";
    const shadowFn = identity;
    const model = setupFn();
    model.addScenario({ scenarioName, shadowFn });
    model.addRow({ rowName, fn: increment, constants: [10] });
    t.same(model.lengths, { x: 10, y: 1, z: 2 });
    t.same(model.row({ rowName }), [10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
    t.same(model.row({ rowName, scenarioName }), [
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
    t.end();
  });

  test("deleting base row deletes shadow row", t => {
    const rowName = "test row";
    const scenarioName = "test scenario";
    const shadowFn = identity;
    const expected = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const model = setupFn();
    model.addScenario({ scenarioName, shadowFn });
    model.addRow({ rowName, fn: increment, constants: [0] });
    t.same(model.lengths, { x: 10, y: 1, z: 2 });
    t.same(model.row({ rowName }), expected);
    t.same(model.row({ rowName, scenarioName }), expected);
    model.deleteRow({ rowName });
    t.same(model.lengths, { x: 0, y: 0, z: 0 });
    t.throws(() => model.row({ rowName }), new Error("Unknown row 'test row'"));
    t.throws(
      () => model.row({ rowName, scenarioName }),
      new Error("Unknown row 'test row'")
    );
    t.end();
  });

  test("deleting base row deletes shadow row but leaves other rows unaffected", t => {
    const rowName = "test row";
    const shadowScenarioName = "shadow scenario";
    const standaloneScenarioName = "standalone scenario";
    const shadowFn = identity;
    const expected = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const model = setupFn();
    model.addScenario({ scenarioName: shadowScenarioName, shadowFn });
    model.addRow({ rowName, fn: increment, constants: [0] });
    model.addScenario({ scenarioName: standaloneScenarioName });
    t.same(model.lengths, { x: 10, y: 1, z: 3 });
    t.same(model.row({ rowName }), expected);
    t.same(model.row({ rowName, shadowScenarioName }), expected);
    t.same(model.row({ rowName, standaloneScenarioName }), expected);
    model.deleteRow({ rowName });
    t.same(model.lengths, { x: 10, y: 1, z: 3 });
    t.throws(() => model.row({ rowName }), new Error("Unknown row 'test row'"));
    t.throws(
      () => model.row({ rowName, shadowScenarioName }),
      new Error("Unknown row 'test row'")
    );
    t.same(
      model.row({ rowName, scenarioName: standaloneScenarioName }),
      expected
    );
    t.end();
  });

  test("cannot edit a shadow scenario", t => {
    const rowName = "test row";
    const scenarioName = "shadow scenario";
    const shadowFn = identity;
    const model = setupFn();
    model.addScenario({ scenarioName, shadowFn });
    t.throws(
      () =>
        model.addRow({ scenarioName, rowName, fn: increment, constants: [0] }),
      new Error("Shadow scenario 'shadow scenario' cannot be edited.")
    );
    t.throws(
      () =>
        model.updateRow({
          scenarioName,
          rowName,
          fn: increment,
          constants: [0]
        }),
      new Error("Shadow scenario 'shadow scenario' cannot be edited.")
    );
    t.throws(
      () =>
        model.patchRow({
          scenarioName,
          rowName,
          fn: increment,
          constants: [0]
        }),
      new Error("Shadow scenario 'shadow scenario' cannot be edited.")
    );
    t.throws(
      () => model.deleteRow({ scenarioName, rowName }),
      new Error("Shadow scenario 'shadow scenario' cannot be edited.")
    );
    t.end();
  });
});

populatedScenarios((test, setupFn) => {
  test("Add shadow scenario after adding multiple rows", t => {
    t.end();
  });

  test("Add multiple rows after adding a shadow scenario", t => {
    t.end();
  });

  test("deleting base rows deletes shadow rows", t => {
    const rowNames = ["independent row", "first lookup row"];
    const expected = [
      [10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    ];
    const scenarioName = "test scenario";
    const shadowFn = identity;
    const model = setupFn();
    model.addScenario({ scenarioName, shadowFn });
    t.same(model.lengths, { x: 10, y: 4, z: 2 });
    rowNames.forEach((rowName, index) => {
      t.same(model.row({ rowName }), expected[index]);
      t.same(model.row({ rowName, scenarioName }), expected[index]);
    });
    model.deleteRows({ rowNames });
    t.same(model.lengths, { x: 10, y: 2, z: 2 });
    rowNames.forEach(rowName => {
      t.throws(
        () => model.row({ rowName }),
        new Error(`Unknown row '${rowName}'`)
      );
      t.throws(
        () => model.row({ rowName, scenarioName }),
        new Error(`Unknown row '${rowName}'`)
      );
    });
    t.end();
  });

  test("cannot delete a base scenario if it has a shadow", t => {
    const shadowScenarioName = "shadow scenario";
    const standaloneScenarioName = "standalone scenario";
    const shadowFn = identity;
    const model = setupFn();
    model.addScenario({ scenarioName: shadowScenarioName, shadowFn });
    t.throws(
      () => model.deleteScenario({ scenarioName: defaultScenario }),
      new Error(
        "Cannot delete scenario 'defaultScenario' with shadows 'shadow scenario'."
      )
    );
    t.end();
  });

  test("can delete a shadow scenario", t => {
    const shadowScenarioName = "shadow scenario";
    const standaloneScenarioName = "standalone scenario";
    const shadowFn = identity;
    const model = setupFn();
    model.addScenario({ scenarioName: shadowScenarioName, shadowFn });
    t.same(model.lengths, { x: 10, y: 4, z: 2 });
    model.deleteScenario({ scenarioName: shadowScenarioName });
    t.same(model.lengths, { x: 10, y: 4, z: 1 });
    t.end();
  });

  test("can delete a base scenario after shadow deleted", t => {
    const baseScenarioName = "base scenario";
    const shadowScenarioName = "shadow scenario";
    const shadowFn = identity;
    const model = setupFn();
    model.addScenario({ scenarioName: baseScenarioName });
    model.addScenario({
      scenarioName: shadowScenarioName,
      baseScenarioName,
      shadowFn
    });
    t.same(model.lengths, { x: 10, y: 4, z: 3 });
    model.deleteScenario({ scenarioName: shadowScenarioName });
    t.same(model.lengths, { x: 10, y: 4, z: 2 });
    model.deleteScenario({ scenarioName: baseScenarioName });
    t.same(model.lengths, { x: 10, y: 4, z: 1 });
    t.end();
  });

  test("shadow transform works without args", t => {
    const scenarioName = "shadow scenario";
    const rowName = "increment row";
    const shadowFn = multiplier;
    const model = setupFn();
    model.addScenario({ scenarioName, shadowFn });
    t.same(model.row({ rowName }), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    t.same(model.row({ rowName, scenarioName }), [
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9
    ]);
    t.end();
  });

  test("shadow transform works", t => {
    const scenarioName = "shadow scenario";
    const rowName = "increment row";
    const shadowFn = multiplier;
    const shadowFnArgs = { multiple: 2 };
    const model = setupFn();
    model.addScenario({ scenarioName, shadowFn, shadowFnArgs });
    t.same(model.row({ rowName }), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    t.same(model.row({ rowName, scenarioName }), [
      0,
      2,
      4,
      6,
      8,
      10,
      12,
      14,
      16,
      18
    ]);
    t.end();
  });
});
