const {
  emptyScenarios,
  populatedScenarios
} = require("../../test/testScaffold");
const {
  increment,
  interval,
  lookup,
  lookupPrevious
} = require("../../../fns/lookupFunctions");
const sequence = require("../../test/sequenceArray");

populatedScenarios((test, setUp) => {
  test("Patch unknown row throws error", t => {
    const model = setUp();
    t.throws(
      () =>
        model.patchRow({
          rowName: "unknown row"
        }),
      new Error("Unknown row 'unknown row'")
    );
    t.end();
  });

  test("Patch row in unknown scenario throws error", t => {
    const model = setUp();
    t.throws(
      () =>
        model.patchRow({
          rowName: "increment row",
          scenarioName: "unknown scenario"
        }),
      new Error("Unknown scenario 'unknown scenario'")
    );
    t.end();
  });

  test("Patch row accepts single dependsOn argument", t => {
    const rowName = "second lookup row";
    const model = setUp();
    t.same(model.row({ rowName }), [1000, 0, 1, 2, 3, 4, 5, 6, 7, 8]);
    model.patchRow({ rowName, dependsOn: "independent row" });
    t.same(model.row({ rowName }), [1000, 10, 11, 12, 13, 14, 15, 16, 17, 18]);
    t.end();
  });
});

emptyScenarios((test, setupFn) => {
  test("Patch row errors if no fn but fnArgs", t => {
    const rowName = "test row";
    const model = setupFn();
    model.addRow({ rowName, constants: sequence(test.meta.intervals.count) });
    t.throws(
      () => model.patchRow({ rowName, fnArgs: { foo: "bar" } }),
      new Error("Function args passed but no function.")
    );
    t.end();
  });

  test("Patch row accepts single fn argument", t => {
    const rowName = "test row";
    const model = setupFn();
    model.addRow({ rowName, fn: increment, constants: [10] });
    t.same(model.row({ rowName }), [10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
    model.patchRow({ rowName, fn: interval });
    t.same(model.row({ rowName }), [10, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    t.end();
  });

  test("Patch row accepts single fnArgs argument if there is a fn", t => {
    const rowName = "test row";
    const model = setupFn();
    model.addRow({ rowName, fn: increment, constants: [10] });
    t.same(model.row({ rowName }), [10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
    model.patchRow({ rowName, fnArgs: { step: 2 } });
    t.same(model.row({ rowName }), [10, 12, 14, 16, 18, 20, 22, 24, 26, 28]);
    t.end();
  });

  test("Patch row accepts an overwriting constants array argument", t => {
    const rowName = "test row";
    const model = setupFn();
    model.addRow({ rowName, fn: increment, constants: [10, undefined, 20] });
    t.same(model.row({ rowName }), [10, 11, 20, 21, 22, 23, 24, 25, 26, 27]);
    model.patchRow({ rowName, constants: [100, undefined, 200] });
    t.same(model.row({ rowName }), [
      100,
      101,
      200,
      201,
      202,
      203,
      204,
      205,
      206,
      207
    ]);
    t.end();
  });

  test("Patch row accepts an overwriting constants dictionary argument", t => {
    const rowName = "test row";
    const model = setupFn();
    model.addRow({ rowName, fn: increment, constants: [10, undefined, 20] });
    t.same(model.row({ rowName }), [10, 11, 20, 21, 22, 23, 24, 25, 26, 27]);
    model.patchRow({
      rowName,
      constants: {
        0: 100,
        2: 200
      }
    });
    t.same(model.row({ rowName }), [
      100,
      101,
      200,
      201,
      202,
      203,
      204,
      205,
      206,
      207
    ]);
    t.end();
  });

  test("Patch row accepts an overwriting constants Map argument", t => {
    const rowName = "test row";
    const model = setupFn();
    model.addRow({ rowName, fn: increment, constants: [10, undefined, 20] });
    t.same(model.row({ rowName }), [10, 11, 20, 21, 22, 23, 24, 25, 26, 27]);
    const constants = new Map();
    constants.set(0, 100);
    constants.set(2, 200);
    model.patchRow({
      rowName,
      constants
    });
    t.same(model.row({ rowName }), [
      100,
      101,
      200,
      201,
      202,
      203,
      204,
      205,
      206,
      207
    ]);
    t.end();
  });

  test("Patch row accepts a merging constants array argument", t => {
    const rowName = "test row";
    const model = setupFn();
    model.addRow({ rowName, fn: increment, constants: [10, undefined, 20] });
    t.same(model.row({ rowName }), [10, 11, 20, 21, 22, 23, 24, 25, 26, 27]);
    model.patchRow({
      rowName,
      constants: [undefined, 1000, 200, undefined, 2000]
    });
    t.same(model.row({ rowName }), [
      10,
      1000,
      200,
      201,
      2000,
      2001,
      2002,
      2003,
      2004,
      2005
    ]);
    t.end();
  });

  test("Patch row accepts a merging constants array argument - earlier constants", t => {
    const rowName = "test row";
    const model = setupFn();
    model.addRow({
      rowName,
      fn: interval,
      constants: [undefined, undefined, undefined, 20]
    });
    t.same(model.row({ rowName }), [0, 1, 2, 20, 4, 5, 6, 7, 8, 9]);
    model.patchRow({
      rowName,
      constants: [undefined, 1000, 200, undefined, 2000]
    });
    t.same(model.row({ rowName }), [0, 1000, 200, 20, 2000, 5, 6, 7, 8, 9]);
    t.end();
  });

  test("Patch row accepts a merging constants dictionary argument", t => {
    const rowName = "test row";
    const model = setupFn();
    model.addRow({ rowName, fn: increment, constants: [10, undefined, 20] });
    t.same(model.row({ rowName }), [10, 11, 20, 21, 22, 23, 24, 25, 26, 27]);
    model.patchRow({
      rowName,
      constants: { 1: 1000, 2: 200, 4: 2000 }
    });
    t.same(model.row({ rowName }), [
      10,
      1000,
      200,
      201,
      2000,
      2001,
      2002,
      2003,
      2004,
      2005
    ]);
    t.end();
  });

  test("Patch row accepts a merging constants dictionary argument - earlier constants", t => {
    const rowName = "test row";
    const model = setupFn();
    model.addRow({
      rowName,
      fn: interval,
      constants: [undefined, undefined, undefined, 20]
    });
    t.same(model.row({ rowName }), [0, 1, 2, 20, 4, 5, 6, 7, 8, 9]);
    model.patchRow({
      rowName,
      constants: { 1: 1000, 2: 200, 4: 2000 }
    });
    t.same(model.row({ rowName }), [0, 1000, 200, 20, 2000, 5, 6, 7, 8, 9]);
    t.end();
  });

  test("Patch row accepts a merging constants Map argument - earlier constants", t => {
    const rowName = "test row";
    const model = setupFn();
    model.addRow({
      rowName,
      fn: interval,
      constants: [undefined, undefined, undefined, 20]
    });
    t.same(model.row({ rowName }), [0, 1, 2, 20, 4, 5, 6, 7, 8, 9]);
    const constants = new Map();
    constants.set(1, 1000);
    constants.set(2, 200);
    constants.set(4, 2000);
    model.patchRow({
      rowName,
      constants
    });
    t.same(model.row({ rowName }), [0, 1000, 200, 20, 2000, 5, 6, 7, 8, 9]);
    t.end();
  });

  test("Patch row accepts a merging constants Map argument - date constants", t => {
    const rowName = "test row";
    const model = setupFn();
    model.addRow({
      rowName,
      fn: interval,
      constants: [undefined, undefined, undefined, 20]
    });
    t.same(model.row({ rowName }), [0, 1, 2, 20, 4, 5, 6, 7, 8, 9]);
    const constants = new Map();
    constants.set(new Date(2020, 1, 1), 1000);
    constants.set(new Date(2020, 2, 1), 200);
    constants.set(4, 2000);
    model.patchRow({
      rowName,
      constants
    });
    t.same(model.row({ rowName }), [0, 1000, 200, 20, 2000, 5, 6, 7, 8, 9]);
    t.end();
  });

  test("Patch row accepts all arguments", t => {
    const rowName = "testRow";
    const model = setupFn();
    model.addRow({ rowName: "first lookup", constants: sequence(10, 10) });
    model.addRow({ rowName: "second lookup", constants: sequence(10, 100) });
    model.addRow({
      rowName,
      fn: lookup,
      dependsOn: "first lookup",
      constants: { 1: 7 }
    });
    t.same(model.row({ rowName }), [10, 7, 12, 13, 14, 15, 16, 17, 18, 19]);
    model.patchRow({
      rowName,
      fn: lookupPrevious,
      dependsOn: "second lookup",
      constants: [123]
    });
    t.same(model.row({ rowName }), [
      123,
      7,
      101,
      102,
      103,
      104,
      105,
      106,
      107,
      108
    ]);
    t.end();
  });
});
