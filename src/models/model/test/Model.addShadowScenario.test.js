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
const { identity } = require("../../../fns/shadowFunctions");
const iterate2D = require("../../../data-structures/iterate2D");

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

  /*
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
   */

  test("cannot delete a base scenario if it has a shadow", t => {
    t.end();
  });

  test("can delete a shadow scenario", t => {
    t.end();
  });

  test("can delete a base scenario after shadow deleted", t => {
    t.end();
  });

  test("cannot edit a shadow scenario", t => {
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
});
