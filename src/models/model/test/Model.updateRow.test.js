const {
  emptyScenarios,
  populatedScenarios
} = require("../../test/testScaffold");
const { increment, interval } = require("../../../fns/lookupFunctions");

populatedScenarios((test, setUp) => {
  test("Update unknown row throws error", t => {
    const model = setUp();
    t.throws(
      () =>
        model.updateRow({
          rowName: "unknown row"
        }),
      new Error("Unknown row 'unknown row'")
    );
    t.end();
  });

  test("Update row in unknown scenario throws error", t => {
    const rowName = "increment row";
    const model = setUp();
    t.throws(
      () =>
        model.updateRow({
          rowName,
          scenarioName: "unknown scenario"
        }),
      new Error("Unknown scenario 'unknown scenario'")
    );
    t.end();
  });

  test("Update row with neither function nor constants throws error", t => {
    const rowName = "increment row";
    const model = setUp();
    t.throws(
      () =>
        model.updateRow({
          rowName
        }),
      new Error("Row has no function, but less constants than intervals.")
    );
    t.end();
  });

  test("Update row with a function with no key throws an error", t => {
    const rowName = "increment row";
    const model = setUp();
    t.throws(
      () =>
        model.updateRow({
          rowName,
          fn: () => 2
        }),
      new Error("function 'fn' must have a 'key' property.")
    );
    t.end();
  });

  test("Update row with no function and smaller constants array than intervals throws error", t => {
    const rowName = "increment row";
    const model = setUp();
    t.throws(
      () => model.updateRow({ rowName, constants: [0] }),
      new Error("Row has no function, but less constants than intervals.")
    );
    t.end();
  });

  test("Update row with no function and fewer constants than intervals throws error", t => {
    const rowName = "increment row";
    const model = setUp();
    const constants = [
      0,
      2,
      4,
      undefined,
      undefined,
      undefined,
      12,
      14,
      16,
      18
    ];
    t.throws(
      () => model.updateRow({ rowName, constants }),
      new Error("Row has no function, but less constants than intervals.")
    );
    t.end();
  });

  test("Update row with fn args but no fn throws error", t => {
    const rowName = "increment row";
    const model = setUp();
    t.throws(
      () =>
        model.updateRow({
          rowName,
          constants: [0],
          fnArgs: { foo: "bar" }
        }),
      new Error("Function args passed but no function.")
    );
    t.end();
  });

  test("Update row updates all with constants", t => {
    const rowName = "increment row";
    const constants = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18];
    const expected = constants;
    const model = setUp();
    model.updateRow({ rowName, constants });
    t.same(model.row({ rowName }), expected);
    t.end();
  });

  test("Update row overwrites all constants even if sparse constants array passed", t => {
    const rowName = "increment row";
    const constants = [
      0,
      2,
      4,
      undefined,
      undefined,
      undefined,
      12,
      14,
      16,
      18
    ];
    const expected = [0, 2, 4, 5, 6, 7, 12, 14, 16, 18];
    const model = setUp();
    model.updateRow({ rowName, constants, fn: increment });
    t.same(model.row({ rowName }), expected);
    t.end();
  });

  test("Update row updates some with constants object", t => {
    const rowName = "increment row";
    const constants = {
      0: 0,
      1: 2,
      2: 4,
      6: 12,
      7: 14,
      8: 16,
      9: 18
    };
    const expected = [0, 2, 4, 5, 6, 7, 12, 14, 16, 18];
    const model = setUp();
    model.updateRow({ rowName, constants, fn: increment });
    t.same(model.row({ rowName }), expected);
    t.end();
  });

  test("Update row updates some with constants Map", t => {
    const rowName = "increment row";
    const constants = new Map([
      [0, 0],
      [1, 2],
      [2, 4],
      [6, 12],
      [7, 14],
      [8, 16],
      [9, 18]
    ]);
    const expected = [0, 2, 4, 5, 6, 7, 12, 14, 16, 18];
    const model = setUp();
    model.updateRow({ rowName, constants, fn: increment });
    t.same(model.row({ rowName }), expected);
    t.end();
  });

  test("Update row updates some with constants Map of Dates", t => {
    const rowName = "increment row";
    const constants = new Map([
      [new Date(2020, 0, 31), 0],
      [new Date(2020, 1, 29), 2],
      [new Date(2020, 2, 1), 4],
      [new Date(2020, 6, 31), 12],
      [new Date(2020, 7, 31), 14],
      [new Date(2020, 8, 30), 16],
      [new Date(2020, 9, 31), 18]
    ]);
    const expected = [0, 2, 4, 5, 6, 7, 12, 14, 16, 18];
    const model = setUp();
    model.updateRow({ rowName, constants, fn: increment });
    t.same(model.row({ rowName }), expected);
    t.end();
  });

  test("Update row with a non-array, non-Map, non-dictionary constants fails", t => {
    const rowName = "increment row";
    const constants = "should fail";
    const model = setUp();

    t.throws(
      () => model.updateRow({ rowName, constants, fn: increment }),
      new Error("Constants must be an array or a dictionary or a map.")
    );
    t.end();
  });

  test("Update row updates all with function", t => {
    const rowName = "increment row";
    const expected = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18];
    const model = setUp();
    const fn = (_, x) => 2 * x;
    fn.key = "test fn";
    model.updateRow({ rowName, fn });
    t.same(model.row({ rowName }), expected);
    t.end();
  });
});

emptyScenarios((test, setupFn) => {
  test("Update row - overwrite behaviour - fn", t => {
    const rowName = "test row";
    const model = setupFn();
    model.addRow({
      rowName,
      fn: increment,
      constants: {
        0: 10,
        2: 20,
        4: 30
      }
    });
    t.same(model.row({ rowName }), [10, 11, 20, 21, 30, 31, 32, 33, 34, 35]);
    model.updateRow({
      rowName,
      fn: interval,
      constants: {
        0: 10,
        2: 20,
        4: 30
      }
    });
    t.same(model.row({ rowName }), [10, 1, 20, 3, 30, 5, 6, 7, 8, 9]);
    t.end();
  });

  test("Update row - remove behaviour - fn", t => {
    const rowName = "test row";
    const model = setupFn();
    model.addRow({
      rowName,
      fn: increment,
      constants: {
        0: 10,
        2: 20,
        4: 30
      }
    });
    t.same(model.row({ rowName }), [10, 11, 20, 21, 30, 31, 32, 33, 34, 35]);
    t.match(model.stringify(), /increment/);
    const constants = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    model.updateRow({
      rowName,
      constants
    });
    t.same(model.row({ rowName }), constants);
    t.notMatch(model.stringify(), /increment/);
    t.end();
  });

  test("Update row - overwrite behaviour - fnArgs", t => {
    const rowName = "test row";
    const model = setupFn();
    model.addRow({
      rowName,
      fn: increment,
      fnArgs: {
        step: 2
      },
      constants: {
        0: 10,
        2: 20,
        4: 30
      }
    });
    t.same(model.row({ rowName }), [10, 12, 20, 22, 30, 32, 34, 36, 38, 40]);
    model.updateRow({
      rowName,
      fn: increment,
      fnArgs: {
        step: 3
      },
      constants: {
        0: 10,
        2: 20,
        4: 30
      }
    });
    t.same(model.row({ rowName }), [10, 13, 20, 23, 30, 33, 36, 39, 42, 45]);
    t.end();
  });

  test("Update row - remove behaviour - fnArgs", t => {
    const rowName = "test row";
    const model = setupFn();
    model.addRow({
      rowName,
      fn: increment,
      fnArgs: {
        step: 2
      },
      constants: {
        0: 10,
        2: 20,
        4: 30
      }
    });
    t.same(model.row({ rowName }), [10, 12, 20, 22, 30, 32, 34, 36, 38, 40]);
    model.updateRow({
      rowName,
      fn: increment,
      constants: {
        0: 10,
        2: 20,
        4: 30
      }
    });
    t.same(model.row({ rowName }), [10, 11, 20, 21, 30, 31, 32, 33, 34, 35]);
    t.end();
  });

  test("Update row - overwite behaviour - constants", t => {
    const rowName = "test row";
    const model = setupFn();
    model.addRow({
      rowName,
      fn: interval,
      constants: {
        0: 10,
        2: 20,
        4: 30
      }
    });
    t.same(model.row({ rowName }), [10, 1, 20, 3, 30, 5, 6, 7, 8, 9]);
    model.updateRow({
      rowName,
      fn: interval,
      constants: {
        6: 10,
        8: 20
      }
    });
    t.same(model.row({ rowName }), [0, 1, 2, 3, 4, 5, 10, 7, 20, 9]);
    t.end();
  });

  test("Update row - remove behaviour - constants", t => {
    const rowName = "test row";
    const model = setupFn();
    model.addRow({
      rowName,
      fn: interval,
      constants: {
        0: 10,
        2: 20,
        4: 30
      }
    });
    t.same(model.row({ rowName }), [10, 1, 20, 3, 30, 5, 6, 7, 8, 9]);
    model.updateRow({
      rowName,
      fn: interval
    });
    t.same(model.row({ rowName }), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    t.end();
  });
});
