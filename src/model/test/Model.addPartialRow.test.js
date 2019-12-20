const { emptyScenarios } = require("./testScaffold");
const { interval } = require("../../fns/coreFunctions");

const count = 10;
const testDefaults = {
  intervals: {
    count
  }
};

emptyScenarios((test, Type) => {
  test("Add partial row of functions, no end", t => {
    const rowName = "test row";
    const start = 5;
    const fn = interval;
    const model = new Type(testDefaults);
    model.addRow({
      rowName,
      fn,
      start
    });
    const row = model.row({ rowName });
    t.same(row, [0, 0, 0, 0, 0, 5, 6, 7, 8, 9]);
    t.end();
  });

  test("Add partial row of functions, no start", t => {
    const rowName = "test row";
    const end = 5;
    const fn = interval;
    const model = new Type(testDefaults);
    model.addRow({
      rowName,
      fn,
      end
    });
    const row = model.row({ rowName });
    t.same(row, [0, 1, 2, 3, 4, 5, 0, 0, 0, 0]);
    t.end();
  });

  test("Add partial row of functions with start and end", t => {
    const rowName = "test row";
    const start = 5;
    const end = 7;
    const fn = interval;
    const model = new Type(testDefaults);
    model.addRow({
      rowName,
      fn,
      start,
      end
    });
    const row = model.row({ rowName });
    t.same(row, [0, 0, 0, 0, 0, 5, 6, 7, 0, 0]);
    t.end();
  });

  test("Add partial row of constants with a start and end", t => {
    const rowName = "test row";
    const start = 5;
    const end = 7;
    const constants = [50, 60, 70];
    const model = new Type(testDefaults);
    model.addRow({
      rowName,
      constants,
      start,
      end
    });
    const row = model.row({ rowName });
    t.same(row, [0, 0, 0, 0, 0, 50, 60, 70, 0, 0]);
    t.end();
  });

  test("Add partial row of constants with a start, no end, and insufficient constants", t => {
    const rowName = "test row";
    const start = 5;
    const constants = [50, 60, 70, 80];
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

  test("Add partial row of constants with a start, no end, and sufficient constants", t => {
    const rowName = "test row";
    const start = 5;
    const constants = [50, 60, 70, 80, 90];
    const model = new Type(testDefaults);
    model.addRow({
      rowName,
      constants,
      start
    });
    const row = model.row({ rowName });
    t.same(row, [0, 0, 0, 0, 0, 50, 60, 70, 80, 90]);
    t.end();
  });

  test("Add partial row of constants with no start, an end, and insufficient constants", t => {
    const rowName = "test row";
    const end = 5;
    const constants = [0, 10, 20];
    const model = new Type(testDefaults);
    t.throws(
      () =>
        model.addRow({
          rowName,
          constants,
          end
        }),
      new Error("Row has no function, but less constants than intervals.")
    );
    t.end();
  });

  test("Add partial row of constants with no start, an end, and sufficient constants", t => {
    const rowName = "test row";
    const end = 5;
    const constants = [0, 10, 20, 30, 40, 50];
    const model = new Type(testDefaults);
    model.addRow({
      rowName,
      constants,
      end
    });
    const row = model.row({ rowName });
    t.same(row, [0, 10, 20, 30, 40, 50, 0, 0, 0, 0]);
    t.end();
  });

  test("Add partial row of constants with start, fn and constants", t => {
    const rowName = "test row";
    const start = 5;
    const constants = [50, 60, 70];
    const model = new Type(testDefaults);
    model.addRow({
      rowName,
      constants,
      start,
      fn: interval
    });
    const row = model.row({ rowName });
    t.same(row, [0, 0, 0, 0, 0, 50, 60, 70, 8, 9]);
    t.end();
  });

  test("Add partial row of constants with end, fn and constants", t => {
    const rowName = "test row";
    const end = 5;
    const constants = [0, 10, 20];
    const model = new Type(testDefaults);
    model.addRow({
      rowName,
      constants,
      end,
      fn: interval
    });
    const row = model.row({ rowName });
    t.same(row, [0, 10, 20, 3, 4, 5, 0, 0, 0, 0]);
    t.end();
  });

  test("Add partial row of constants with start and end, fn and constants", t => {
    const rowName = "test row";
    const start = 3;
    const end = 7;
    const constants = [30, 40, 50];
    const model = new Type(testDefaults);
    model.addRow({
      rowName,
      constants,
      start,
      end,
      fn: interval
    });
    const row = model.row({ rowName });
    t.same(row, [0, 0, 0, 30, 40, 50, 6, 7, 0, 0]);
    t.end();
  });
});
