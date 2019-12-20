const { populatedScenarios } = require("./testScaffold");
const { increment } = require("../../fns/coreFunctions");

const rowName = "increment row";

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
    const model = setUp();
    t.throws(
      () =>
        model.updateRow({
          rowName
        }),
      new Error("No function or constants passed.")
    );
    t.end();
  });

  test("Update row with a function with no key throws an error", t => {
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
    const model = setUp();
    t.throws(
      () => model.updateRow({ rowName, constants: [0] }),
      new Error("Row has no function, but less constants than intervals.")
    );
    t.end();
  });

  test("Update row with no function and fewer constants than intervals throws error", t => {
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
      new Error("Row has no function, but undefined constants.")
    );
    t.end();
  });

  test("Update row updates all with constants", t => {
    const constants = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18];
    const expected = constants;
    const model = setUp();
    model.updateRow({ rowName, constants });
    t.same(model.row({ rowName }), expected);
    t.end();
  });

  test("Update row updates some with sparse constants array", t => {
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

  test("Update row with a non-array, non-object constants fails", t => {
    const constants = "should fail";
    const model = setUp();

    t.throws(
      () => model.updateRow({ rowName, constants, fn: increment }),
      new Error("Constants must be an array or an object.")
    );
    t.end();
  });

  test("Update row updates all with function", t => {
    const expected = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18];
    const model = setUp();
    const fn = (_, x) => 2 * x;
    fn.key = "test fn";
    model.updateRow({ rowName, fn });
    t.same(model.row({ rowName }), expected);
    t.end();
  });
});
