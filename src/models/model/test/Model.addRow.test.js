const { emptyScenarios } = require("../../test/testScaffold");
const sequence = require("../../test/sequenceArray");
const {
  increment,
  interval,
  previous
} = require("../../../fns/lookupFunctions");

emptyScenarios((test, setupFn) => {
  test("Add row with unknown scenario throws error", t => {
    const rowKey = "test row";
    const fn = () => {};
    const scenarioKey = "unknown test scenario";
    const args = { rowKey, fn, scenarioKey };

    const model = setupFn();
    t.throws(
      () => model.addRow(args),
      new Error("Unknown scenario 'unknown test scenario'")
    );
    t.end();
  });

  test("Add row with function with no key throws error", t => {
    const rowKey = "test row";
    const fn = () => {};
    const args = { rowKey, fn };

    const model = setupFn();
    t.throws(
      () => model.addRow(args),
      new Error("Function 'fn' must have a 'key' property.")
    );
    t.end();
  });

  test("Add row with existing key throws error", t => {
    const rowKey = "test row";
    const fn = () => () => {};
    fn.key = "test fn";
    const args = { rowKey, fn };

    const model = setupFn();
    model.addRow(args);
    t.throws(
      () => model.addRow(args),
      new Error("Row 'test row' already exists.")
    );
    t.end();
  });

  test("Add row with no key throws error", t => {
    const fn = () => () => {};
    fn.key = "test fn";
    const args = { fn };

    const model = setupFn();
    t.throws(() => model.addRow(args), new Error("A row key is required"));
    t.end();
  });

  test("Add row with no function and smaller constants array than intervals throws error", t => {
    const model = setupFn();
    const args = { rowKey: "test row", constants: [0] };
    t.throws(
      () => model.addRow(args),
      new Error("Row has no function, but less constants than intervals.")
    );
    t.end();
  });

  test("Add row with no function and fewer constants that intervals throws error", t => {
    const model = setupFn();
    const args = { rowKey: "test row", constants: { 0: 5 } };
    t.throws(
      () => model.addRow(args),
      new Error("Row has no function, but less constants than intervals.")
    );
    t.end();
  });

  test("Add row with no function and undefined constants", t => {
    const model = setupFn();
    const constants = [0, 1, 2, 3, 4, 5, 6, undefined, 8, 9];
    const args = { rowKey: "test row", constants };
    t.throws(
      () => model.addRow(args),
      new Error("Row has no function, but less constants than intervals.")
    );
    t.end();
  });

  test("Add row of constants", t => {
    const rowKey = "test row";
    const constants = sequence(test.meta.intervals.count);
    const model = setupFn();
    model.addRow({
      rowKey,
      constants
    });
    for (let i = 0; i < test.meta.intervals.count; i++) {
      t.equal(model[i][0][0], constants[i]);
    }
    t.end();
  });

  test("retrieve added row of constants", t => {
    const rowKey = "test row";
    const constants = sequence(test.meta.intervals.count);
    const model = setupFn();
    model.addRow({
      rowKey,
      constants
    });
    const row = model.row({ rowKey });
    t.same(row, constants);
    t.end();
  });

  test("Add partial constants via object", t => {
    const rowKey = "test row";
    const constants = {
      1: 10,
      3: 10,
      7: 10
    };
    const expected = [0, 10, 2, 10, 4, 5, 6, 10, 8, 9];
    const model = setupFn();
    model.addRow({
      rowKey,
      constants,
      fn: interval
    });
    const row = model.row({ rowKey });
    t.same(row, expected);
    t.end();
  });

  test("Add partial constants via Map", t => {
    const rowKey = "test row";
    const constants = new Map([
      [1, 10],
      [3, 10],
      [7, 10]
    ]);
    const expected = [0, 10, 2, 10, 4, 5, 6, 10, 8, 9];
    const model = setupFn();
    model.addRow({
      rowKey,
      constants,
      fn: interval
    });
    const row = model.row({ rowKey });
    t.same(row, expected);
    t.end();
  });

  test("Add partial constants via object fails if keys are not integers", t => {
    const rowKey = "test row";
    const constants = {
      1: 10,
      a: 10,
      7: 10
    };
    const model = setupFn();
    const args = { rowKey: "test row", constants, fn: interval };
    t.throws(() => {
      model.addRow(args);
    }, new Error("Constant key 'a' must be an integer."));
    t.end();
  });

  test("Add partial constants via Map fails if keys are not integers", t => {
    const rowKey = "test row";
    const constants = new Map([
      [1, 10],
      ["a", 10],
      [7, 10]
    ]);
    const model = setupFn();
    const args = { rowKey: "test row", constants, fn: interval };
    t.throws(() => {
      model.addRow(args);
    }, new Error("Constant key 'a' must be an integer."));
    t.end();
  });

  test("Add partial constants via object fails if indices greater than interval count", t => {
    const rowKey = "test row";
    const constants = {
      1: 10,
      11: 10,
      7: 10
    };
    const model = setupFn();
    const args = { rowKey: "test row", constants, fn: interval };
    t.throws(() => {
      model.addRow(args);
    }, new Error("Constant index 11 must be 9 or less."));
    t.end();
  });

  test("Add partial constants via Map fails if indices greater than interval count", t => {
    const rowKey = "test row";
    const constants = new Map([
      [1, 10],
      [11, 10],
      [7, 10]
    ]);
    const model = setupFn();
    const args = { rowKey: "test row", constants, fn: interval };
    t.throws(() => {
      model.addRow(args);
    }, new Error("Constant index 11 must be 9 or less."));
    t.end();
  });

  test("retrieve row fails if unknown row key", t => {
    const rowKey = "test row";
    const constants = sequence(test.meta.intervals.count);
    const model = setupFn();
    model.addRow({
      rowKey,
      constants
    });
    t.throws(
      () => model.row({ rowKey: "unknown row" }),
      new Error("Unknown row 'unknown row'")
    );
    t.end();
  });

  test("retrieve row fails if unknown scenario key", t => {
    const rowKey = "test row";
    const constants = sequence(test.meta.intervals.count);
    const model = setupFn();
    model.addRow({
      rowKey,
      constants
    });
    t.throws(
      () => model.row({ rowKey, scenarioKey: "unknown scenario" }),
      new Error("Unknown scenario 'unknown scenario'")
    );
    t.end();
  });

  test("Add sequence row using zero initial constant", t => {
    const rowKey = "test row";
    const model = setupFn();
    model.addRow({
      rowKey,
      fn: increment,
      constants: [0]
    });
    const row = model.row({ rowKey });
    t.same(row, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    t.end();
  });

  test("Add fixed value row using initial constant", t => {
    const rowKey = "test row";
    const model = setupFn();
    model.addRow({
      rowKey,
      fn: previous,
      constants: [8]
    });
    const row = model.row({ rowKey });
    t.same(row, [8, 8, 8, 8, 8, 8, 8, 8, 8, 8]);
    t.end();
  });

  test("Add sequence row using custom initial constant", t => {
    const rowKey = "test row";
    const initialValue = 500;
    const model = setupFn();
    model.addRow({
      rowKey,
      fn: increment,
      constants: [initialValue]
    });
    const row = model.row({ rowKey });
    t.same(row, [500, 501, 502, 503, 504, 505, 506, 507, 508, 509]);
    t.end();
  });

  test("Add sequence row using multiple constants", t => {
    const rowKey = "test row";
    const model = setupFn();
    const constants = new Array(5);
    constants[0] = 3;
    constants[2] = 13;
    constants[4] = 113;
    constants[6] = 0;
    model.addRow({
      rowKey,
      fn: increment,
      constants
    });
    const row = model.row({ rowKey });
    t.same(row, [3, 4, 13, 14, 113, 114, 0, 1, 2, 3]);
    t.end();
  });

  test("Add sequence row using multiple constants via Map", t => {
    const rowKey = "test row";
    const model = setupFn();
    const constants = new Map([
      [0, 3],
      [2, 13],
      [4, 113],
      [6, 0]
    ]);
    model.addRow({
      rowKey,
      fn: increment,
      constants
    });
    const row = model.row({ rowKey });
    t.same(row, [3, 4, 13, 14, 113, 114, 0, 1, 2, 3]);
    t.end();
  });

  test("Add row of functions", t => {
    const rowKey = "test row";
    const model = setupFn();
    model.addRow({
      rowKey,
      fn: interval
    });
    const row = model.row({ rowKey });
    t.same(row, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    t.end();
  });

  test("Add partial row of functions", t => {
    const rowKey = "test row";
    const start = 5;
    const end = 7;
    const fn = interval;
    const model = setupFn();
    model.addRow({
      rowKey,
      fn,
      start,
      end
    });
    const row = model.row({ rowKey });
    t.same(row, [0, 0, 0, 0, 0, 5, 6, 7, 0, 0]);
    t.end();
  });

  test("Add multiple rows", t => {
    const model = setupFn();
    const rowKeys = ["row 0", "row 1", "row2"];
    rowKeys.forEach((rowKey, index) => {
      model.addRow({
        rowKey,
        fn: increment,
        constants: [index]
      });
    });
    rowKeys.forEach((rowKey, index) => {
      const row = model.row({ rowKey });
      t.same(row, [
        0 + index,
        1 + index,
        2 + index,
        3 + index,
        4 + index,
        5 + index,
        6 + index,
        7 + index,
        8 + index,
        9 + index
      ]);
    });
    t.end();
  });
});
