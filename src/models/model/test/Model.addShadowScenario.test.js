const {
  emptyScenarios,
  populatedScenarios
} = require("../../test/testScaffold");
const functionsDictionary = require("../../../fns/functionsDictionary");
const { increment, lookup } = require("../../../fns/lookupFunctions");
const { identity, multiplier } = require("../../../fns/shadowFunctions");
const { add } = require("../../../maths/coreOperations");
const { defaultScenario } = require("../modelMetadata");
const { multiply } = require("../../../maths/coreOperations");

const testLookupShadowFn = (rowContext, interval, value) => {
  const lookupRowContext = {
    ...rowContext,
    scenario: rowContext.baseScenario
  };
  const multiplicand = lookup(lookupRowContext, interval);
  return multiply(multiplicand, value);
};
testLookupShadowFn.key = "Model.addShadowScenario.test lookup shadow fn";
functionsDictionary.add(testLookupShadowFn);

emptyScenarios((test, setupFn, { Type }) => {
  test("Add shadow scenario must have a shadow function", t => {
    const scenarioKey = "test scenario";
    const model = setupFn();
    t.throws(
      () => model.addScenario({ scenarioKey, shadow: { fn: "do it" } }),
      new Error("Function 'do it' must be a function.")
    );
    t.end();
  });

  test("Shadow function must have a key", t => {
    const scenarioKey = "test scenario";
    const shadow = { fn: () => 5 };
    const model = setupFn();
    t.throws(
      () => model.addScenario({ scenarioKey, shadow }),
      new Error("Function 'fn' must have a 'key' property.")
    );
    t.end();
  });

  test("Add empty shadow scenario does not error", t => {
    const scenarioKey = "test scenario";
    const shadow = { fn: identity };
    const model = setupFn();
    model.addScenario({ scenarioKey, shadow });
    t.same(model.lengths, { x: 0, y: 0, z: 0 });
    t.end();
  });

  test("Add empty shadow scenario serializes consistently", t => {
    const scenarioKey = "test scenario";
    const shadow = { fn: identity };
    const pre = setupFn();
    pre.addScenario({ scenarioKey, shadow });
    const s = pre.stringify();
    const post = Type.parse(s);
    t.same(post, pre);
    t.end();
  });

  test("Add shadow scenario after adding a single row", t => {
    const rowKey = "test row";
    const scenarioKey = "test scenario";
    const shadow = { fn: identity };
    const model = setupFn();
    model.addRow({ rowKey, fn: increment, constants: [10] });
    t.same(model.lengths, { x: 10, y: 1, z: 1 });
    t.same(model.row({ rowKey }), [10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
    model.addScenario({ scenarioKey, shadow });
    t.same(model.lengths, { x: 10, y: 1, z: 2 });
    t.same(model.row({ rowKey, scenarioKey }), [
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
    const rowKey = "test row";
    const scenarioKey = "test scenario";
    const shadow = { fn: identity };
    const model = setupFn();
    model.addScenario({ scenarioKey, shadow });
    model.addRow({ rowKey, fn: increment, constants: [10] });
    t.same(model.lengths, { x: 10, y: 1, z: 2 });
    t.same(model.row({ rowKey }), [10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
    t.same(model.row({ rowKey, scenarioKey }), [
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
    const rowKey = "test row";
    const scenarioKey = "test scenario";
    const shadow = { fn: identity };
    const expected = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const model = setupFn();
    model.addScenario({ scenarioKey, shadow });
    model.addRow({ rowKey, fn: increment, constants: [0] });
    t.same(model.lengths, { x: 10, y: 1, z: 2 });
    t.same(model.row({ rowKey }), expected);
    t.same(model.row({ rowKey, scenarioKey }), expected);
    model.deleteRow({ rowKey });
    t.same(model.lengths, { x: 0, y: 0, z: 0 });
    t.throws(() => model.row({ rowKey }), new Error("Unknown row 'test row'"));
    t.throws(
      () => model.row({ rowKey, scenarioKey }),
      new Error("Unknown row 'test row'")
    );
    t.end();
  });

  test("deleting base row deletes shadow row but leaves other rows unaffected", t => {
    const rowKey = "test row";
    const shadowScenarioName = "shadow scenario";
    const standaloneScenarioName = "standalone scenario";
    const shadow = { fn: identity };
    const expected = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const model = setupFn();
    model.addScenario({ scenarioKey: shadowScenarioName, shadow });
    model.addRow({ rowKey, fn: increment, constants: [0] });
    model.addScenario({ scenarioKey: standaloneScenarioName });
    t.same(model.lengths, { x: 10, y: 1, z: 3 });
    t.same(model.row({ rowKey }), expected);
    t.same(model.row({ rowKey, shadowScenarioName }), expected);
    t.same(model.row({ rowKey, standaloneScenarioName }), expected);
    model.deleteRow({ rowKey });
    t.same(model.lengths, { x: 10, y: 1, z: 3 });
    t.throws(() => model.row({ rowKey }), new Error("Unknown row 'test row'"));
    t.throws(
      () => model.row({ rowKey, shadowScenarioName }),
      new Error("Unknown row 'test row'")
    );
    t.same(
      model.row({ rowKey, scenarioKey: standaloneScenarioName }),
      expected
    );
    t.end();
  });

  test("cannot edit a shadow scenario", t => {
    const rowKey = "test row";
    const scenarioKey = "shadow scenario";
    const shadow = { fn: identity };
    const model = setupFn();
    model.addScenario({ scenarioKey, shadow });
    t.throws(
      () =>
        model.addRow({ scenarioKey, rowKey, fn: increment, constants: [0] }),
      new Error("Shadow scenario 'shadow scenario' cannot be edited.")
    );
    t.throws(
      () =>
        model.updateRow({
          scenarioKey,
          rowKey,
          fn: increment,
          constants: [0]
        }),
      new Error("Shadow scenario 'shadow scenario' cannot be edited.")
    );
    t.throws(
      () =>
        model.patchRow({
          scenarioKey,
          rowKey,
          fn: increment,
          constants: [0]
        }),
      new Error("Shadow scenario 'shadow scenario' cannot be edited.")
    );
    t.throws(
      () => model.deleteRow({ scenarioKey, rowKey }),
      new Error("Shadow scenario 'shadow scenario' cannot be edited.")
    );
    t.end();
  });
});

populatedScenarios((test, setupFn, fixture) => {
  test("Add shadow scenario after adding multiple rows", t => {
    t.end();
  });

  test("Add multiple rows after adding a shadow scenario", t => {
    t.end();
  });

  test("deleting base rows deletes shadow rows", t => {
    const rowKeys = ["independent row", "first lookup row"];
    const expected = [
      [10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    ];
    const scenarioKey = "test scenario";
    const shadow = { fn: identity };
    const model = setupFn();
    model.addScenario({ scenarioKey, shadow });
    t.same(model.lengths, fixture.expectedLengths(0, 0, 1));
    rowKeys.forEach((rowKey, index) => {
      t.same(model.row({ rowKey }), expected[index]);
      t.same(model.row({ rowKey, scenarioKey }), expected[index]);
    });
    model.deleteRows({ rowKeys });
    const expectedRowsDelta = fixture.hasMultipleScenarios ? 0 : -2;
    t.same(model.lengths, fixture.expectedLengths(0, expectedRowsDelta, 1));
    rowKeys.forEach(rowKey => {
      t.throws(
        () => model.row({ rowKey }),
        new Error(`Unknown row '${rowKey}'`)
      );
      t.throws(
        () => model.row({ rowKey, scenarioKey }),
        new Error(`Unknown row '${rowKey}'`)
      );
    });
    t.end();
  });

  test("cannot delete a base scenario if it has a shadow", t => {
    const shadowScenarioName = "shadow scenario";
    const standaloneScenarioName = "standalone scenario";
    const shadow = { fn: identity };
    const model = setupFn();
    model.addScenario({ scenarioKey: shadowScenarioName, shadow });
    const errMsg = fixture.hasShadowScenario
      ? "Cannot delete scenario 'defaultScenario' with shadows 'fixture shadow scenario, shadow scenario'."
      : "Cannot delete scenario 'defaultScenario' with shadows 'shadow scenario'.";
    t.throws(
      () => model.deleteScenario({ scenarioKey: defaultScenario }),
      new Error(errMsg)
    );
    t.end();
  });

  test("can delete a shadow scenario", t => {
    const shadowScenarioName = "shadow scenario";
    const standaloneScenarioName = "standalone scenario";
    const shadow = { fn: identity };
    const model = setupFn();
    model.addScenario({ scenarioKey: shadowScenarioName, shadow });
    t.same(model.lengths, fixture.expectedLengths(0, 0, 1));
    model.deleteScenario({ scenarioKey: shadowScenarioName });
    t.same(model.lengths, fixture.expectedLengths());
    t.end();
  });

  test("can delete a shadow scenario without affecting other shadows", t => {
    const shadowScenarioNames = ["shadow scenario 1", "shadow scenario 2"];
    const shadow = { fn: identity };
    const model = setupFn();
    shadowScenarioNames.forEach(shadowScenarioName => {
      model.addScenario({ scenarioKey: shadowScenarioName, shadow });
    });
    t.same(model.lengths, fixture.expectedLengths(0, 0, 2));
    model.deleteScenario({ scenarioKey: shadowScenarioNames[1] });
    t.same(
      model.row({
        rowKey: "increment row",
        scenarioKey: shadowScenarioNames[0]
      }),
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    );
    t.same(model.lengths, fixture.expectedLengths(0, 0, 1));
    t.end();
  });

  test("can delete a base scenario after shadow deleted", t => {
    const baseScenarioKey = "base scenario";
    const shadowScenarioName = "shadow scenario";
    const shadow = { fn: identity };
    const model = setupFn();
    model.addScenario({ scenarioKey: baseScenarioKey });
    model.addScenario({
      scenarioKey: shadowScenarioName,
      baseScenarioKey,
      shadow
    });
    t.same(model.lengths, fixture.expectedLengths(0, 0, 2));
    model.deleteScenario({ scenarioKey: shadowScenarioName });
    t.same(model.lengths, fixture.expectedLengths(0, 0, 1));
    model.deleteScenario({ scenarioKey: baseScenarioKey });
    t.same(model.lengths, fixture.expectedLengths());
    t.end();
  });

  test("shadow transform works without args", t => {
    const scenarioKey = "shadow scenario";
    const rowKey = "increment row";
    const shadow = { fn: multiplier };
    const model = setupFn();
    model.addScenario({ scenarioKey, shadow });
    t.same(model.row({ rowKey }), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    t.same(model.row({ rowKey, scenarioKey }), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    t.end();
  });

  test("shadow transform with constant args works", t => {
    const scenarioKey = "shadow scenario";
    const rowKey = "increment row";
    const shadow = { fn: multiplier, fnArgs: { multiple: 2 } };
    const model = setupFn();
    model.addScenario({ scenarioKey, shadow });
    t.same(model.row({ rowKey }), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    t.same(model.row({ rowKey, scenarioKey }), [
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

  test("shadow transform with lookup args works", t => {
    const scenarioKey = "shadow scenario";
    const rowKey = "increment row";
    const model = setupFn();
    model.addScenario({
      scenarioKey,
      shadow: {
        fn: testLookupShadowFn,
        dependsOn: { lookup: "increment row" }
      }
    });
    t.same(model.row({ rowKey }), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    t.same(model.row({ rowKey, scenarioKey }), [
      0,
      1,
      4,
      9,
      16,
      25,
      36,
      49,
      64,
      81
    ]);
    t.end();
  });

  test("Populated shadow scenario serializes consistently", t => {
    const scenarioKey = "test scenario";
    const shadow = { fn: multiplier, fnArgs: { multiple: 2 } };
    const pre = setupFn();
    pre.addScenario({ scenarioKey, shadow });
    const s = pre.stringify();
    const post = fixture.Type.parse(s);
    t.same(post, pre);
    t.end();
  });

  test("shadow transform works after serialisation", t => {
    const scenarioKey = "shadow scenario";
    const rowKey = "increment row";
    const shadow = { fn: multiplier, fnArgs: { multiple: 2 } };
    const pre = setupFn();
    pre.addScenario({ scenarioKey, shadow });
    const s = pre.stringify();
    const post = fixture.Type.parse(s);
    t.same(post.row({ rowKey }), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    t.same(post.row({ rowKey, scenarioKey }), [
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

  test("scenario() works for shadow scenario", t => {
    const scenarioKey = "shadow scenario";
    const rowKey = "increment row";
    const shadow = { fn: identity };
    const model = setupFn();
    model.addScenario({ scenarioKey, shadow });
    t.same(model.scenario({ scenarioKey }), model.scenario());
    t.end();
  });

  test("scenario() with dates works for shadow scenario", t => {
    const scenarioKey = "shadow scenario";
    const rowKey = "increment row";
    const shadow = { fn: identity };
    const model = setupFn();
    model.addScenario({ scenarioKey, shadow });
    t.same(
      model.scenario({ scenarioKey, includeDates: true }),
      model.scenario({ includeDates: true })
    );
    t.end();
  });

  test("cannot delete a row used by a shadow fn", t => {
    const scenarioKey = "shadow scenario";
    const rowKey = "independent row";
    const shadow = { fn: lookup, dependsOn: { lookup: rowKey } };
    const model = setupFn();
    model.addScenario({ scenarioKey, shadow });
    t.throws(
      () => model.deleteRow({ rowKey }),
      new Error(
        "Cannot delete row 'independent row' as 'defaultScenario' depends on it."
      )
    );
    t.end();
  });

  test("can delete a row used by a shadow fn once the scenario is deleted", t => {
    const scenarioKey = "shadow scenario";
    const rowKey = "independent row";
    const shadow = { fn: lookup, dependsOn: { lookup: rowKey } };
    const model = setupFn();
    model.addScenario({ scenarioKey, shadow });
    model.deleteScenario({ scenarioKey });
    t.doesNotThrow(() => model.deleteRow({ rowKey }));
    t.end();
  });
});
