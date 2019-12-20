const { emptyScenarios } = require("./testScaffold");
const { increment } = require("../../fns/coreFunctions");

const count = 10;
const testDefaults = {
  intervals: {
    count
  }
};

emptyScenarios((test, Type) => {
  test("Add partial row of constants via Map with too few values", t => {
    const rowName = "test row";
    const start = 5;
    const constants = new Map([
      [8, 8],
      [9, 9]
    ]);
    const model = new Type(testDefaults);
    t.throws(
      () =>
        model.addRow({
          rowName,
          constants,
          start
        }),
      new Error("Row has no function, but less constants than intervals.")
    );
    t.end();
  });

  test("Add partial row of constants via Map with too small value", t => {
    const rowName = "test row";
    const start = 7;
    const constants = new Map([
      [3, 3],
      [8, 8],
      [9, 9]
    ]);
    const model = new Type(testDefaults);
    t.throws(
      () =>
        model.addRow({
          rowName,
          constants,
          start
        }),
      new Error("Constant index 3 must be 7 or more.")
    );
    t.end();
  });

  test("Add partial row of constants via Map with too large value", t => {
    const rowName = "test row";
    const start = 3;
    const end = 5;
    const constants = new Map([
      [3, 3],
      [4, 4],
      [9, 9]
    ]);
    const model = new Type(testDefaults);
    t.throws(
      () =>
        model.addRow({
          rowName,
          constants,
          start,
          end
        }),
      new Error("Constant index 9 must be 5 or less.")
    );
    t.end();
  });

  test("Add partial row of constants via Map with start, no fn", t => {
    const rowName = "test row";
    const start = 7;
    const constants = new Map([
      [7, 70],
      [8, 80],
      [9, 90]
    ]);
    const model = new Type(testDefaults);
    model.addRow({
      rowName,
      constants,
      start
    });
    const row = model.row({ rowName });
    t.same(row, [0, 0, 0, 0, 0, 0, 0, 70, 80, 90]);
    t.end();
  });

  test("Add partial row of constants via Map with end, no fn", t => {
    const rowName = "test row";
    const end = 3;
    const constants = new Map([
      [0, 0],
      [1, 1],
      [2, 2],
      [3, 3]
    ]);
    const model = new Type(testDefaults);
    model.addRow({
      rowName,
      constants,
      end
    });
    const row = model.row({ rowName });
    t.same(row, [0, 1, 2, 3, 0, 0, 0, 0, 0, 0]);
    t.end();
  });

  test("Add partial row of constants via Map with start and end, no fn", t => {
    const rowName = "test row";
    const start = 3;
    const end = 6;
    const constants = new Map([
      [3, 30],
      [4, 40],
      [5, 50],
      [6, 60]
    ]);
    const model = new Type(testDefaults);
    model.addRow({
      rowName,
      constants,
      start,
      end
    });
    const row = model.row({ rowName });
    t.same(row, [0, 0, 0, 30, 40, 50, 60, 0, 0, 0]);
    t.end();
  });

  test("Add partial row of constants via Map with start and fn", t => {
    const rowName = "test row";
    const start = 4;
    const constants = new Map([
      [7, 70],
      [8, 80]
    ]);
    const model = new Type(testDefaults);
    model.addRow({
      rowName,
      constants,
      start,
      fn: increment
    });
    const row = model.row({ rowName });
    t.same(row, [0, 0, 0, 0, 1, 2, 3, 70, 80, 81]);
    t.end();
  });

  test("Add partial row of constants via Map with end and fn", t => {
    const rowName = "test row";
    const end = 3;
    const constants = new Map([
      [0, 100],
      [2, 200]
    ]);
    const model = new Type(testDefaults);
    model.addRow({
      rowName,
      constants,
      end,
      fn: increment
    });
    const row = model.row({ rowName });
    t.same(row, [100, 101, 200, 201, 0, 0, 0, 0, 0, 0]);
    t.end();
  });

  test("Add partial row of constants via Map with start and end and fn", t => {
    const rowName = "test row";
    const start = 3;
    const end = 6;
    const constants = new Map([
      [4, 40],
      [6, 60]
    ]);
    const model = new Type(testDefaults);
    model.addRow({
      rowName,
      constants,
      start,
      end,
      fn: increment
    });
    const row = model.row({ rowName });
    t.same(row, [0, 0, 0, 1, 40, 41, 60, 0, 0, 0]);
    t.end();
  });
});
